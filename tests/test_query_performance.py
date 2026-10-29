"""Run the application's SQL against SQLite with deterministic work budgets."""

import pathlib
import random
import re
import sqlite3
import unittest
from contextlib import closing


ROOT = pathlib.Path(__file__).resolve().parents[1]


def database():
    connection = sqlite3.connect(":memory:")
    for migration in sorted((ROOT / "drizzle").glob("*.sql")):
        connection.executescript(migration.read_text())
    return connection


def refresh_sql():
    source = (ROOT / "db/queries/tag-aggregates.ts").read_text()
    return re.search(r"db.run\(sql`([\s\S]*?)`\)", source).group(1)


class TagAggregatesTest(unittest.TestCase):
    def test_refresh_matches_original_query(self):
        original = (ROOT / "drizzle/0001_add_tag_aggregates.sql").read_text()
        original = original[original.index("UPDATE Tag SET"):]
        rng = random.Random(0)
        with closing(database()) as db:
            db.executemany(
                "INSERT INTO Tag(id,name,slug) VALUES(?,?,?)",
                [(i, str(i), str(i)) for i in range(1, 31)],
            )
            db.executemany(
                "INSERT INTO Video(id,youtubeId,views,disabled,syncStatus,publishStatus) "
                "VALUES(?,?,?,?,?,?)",
                [(i, str(i), rng.choice([None, 0, i * 100]), rng.randrange(2),
                  rng.choice(["Full", "Snippet"]),
                  rng.choice(["Published", "Unpublished"])) for i in range(1, 501)],
            )
            db.executemany(
                "INSERT OR IGNORE INTO TagVideo(tagId,videoId) VALUES(?,?)",
                [(rng.choice([None, *range(1, 30), 999]),
                  rng.choice([None, *range(1, 501), 999])) for _ in range(2500)],
            )
            for _ in range(2):
                # Start with stale values, including a tag with no associations.
                db.execute("UPDATE Tag SET videoCount=99, viewsCount=99")
                db.execute(original)
                expected = db.execute(
                    "SELECT id,videoCount,viewsCount FROM Tag ORDER BY id"
                ).fetchall()
                db.execute("UPDATE Tag SET videoCount=99, viewsCount=99")
                db.execute(refresh_sql())
                self.assertEqual(
                    db.execute("SELECT id,videoCount,viewsCount FROM Tag ORDER BY id").fetchall(),
                    expected,
                )
                db.execute("UPDATE Video SET disabled=1 WHERE id % 3=0")
                db.execute("DELETE FROM TagVideo WHERE tagId=1")

    def test_counts_only_visible_videos_and_clears_stale_totals(self):
        with closing(database()) as db:
            db.executemany(
                "INSERT INTO Tag(id, name, slug, videoCount, viewsCount) VALUES(?,?,?,99,99)",
                [(i, str(i), str(i)) for i in range(1, 6)],
            )
            db.executemany(
                "INSERT INTO Video(id,youtubeId,views,disabled,syncStatus,publishStatus) "
                "VALUES(?,?,?,?,?,?)",
                [
                    (1, "one", 10, 0, "Full", "Published"),
                    (2, "null-views", None, 0, "Full", "Published"),
                    (3, "disabled", 20, 1, "Full", "Published"),
                    (4, "snippet", 30, 0, "Snippet", "Published"),
                    (5, "unpublished", 40, 0, "Full", "Unpublished"),
                ],
            )
            db.executemany(
                "INSERT INTO TagVideo(tagId,videoId) VALUES(?,?)",
                [(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (2, 2), (3, 3), (5, 999), (None, 1)],
            )
            expected = [(1, 2, 10), (2, 1, 0), (3, 0, 0), (4, 0, 0), (5, 0, 0)]
            for _ in range(2):
                db.execute(refresh_sql())
                self.assertEqual(
                    db.execute("SELECT id,videoCount,viewsCount FROM Tag ORDER BY id").fetchall(),
                    expected,
                )

    def test_refresh_work_is_bounded_at_production_scale(self):
        with closing(database()) as db:
            db.executemany(
                "INSERT INTO Tag(id,name,slug) VALUES(?,?,?)",
                [(i, str(i), str(i)) for i in range(1, 137)],
            )
            db.executemany(
                "INSERT INTO Video(id,youtubeId,views,disabled,syncStatus,publishStatus) "
                "VALUES(?,?,?,?,?,?)",
                [(i, str(i), i, i % 10 == 0, "Full", "Published") for i in range(1, 31001)],
            )
            db.executemany(
                "INSERT INTO TagVideo(tagId,videoId) VALUES(?,?)",
                [(1 + i % 136, i) for i in range(1, 31001)],
            )
            steps = 0

            def progress():
                nonlocal steps
                steps += 1000
                return steps > 3_000_000

            db.set_progress_handler(progress, 1000)
            try:
                db.execute(refresh_sql())
            finally:
                db.set_progress_handler(None, 0)
            self.assertEqual(
                db.execute("SELECT SUM(videoCount),SUM(viewsCount) FROM Tag").fetchone(),
                (27900, 432450000),
            )

    def test_visible_video_pages_do_not_scan_the_catalog(self):
        with closing(database()) as db:
            db.executemany(
                "INSERT INTO Video(id,youtubeId,views,disabled,syncStatus,publishStatus,publishedAt) "
                "VALUES(?,?,?,?,?,?,?)",
                [(i, str(i), i, i % 10 == 0, "Full", "Published", f"2026-{i:06d}")
                 for i in range(1, 31001)],
            )
            for order_key in ["publishedAt", "views"]:
                with self.subTest(order_key=order_key):
                    steps = 0

                    def progress():
                        nonlocal steps
                        steps += 100
                        return steps > 5000

                    db.set_progress_handler(progress, 100)
                    try:
                        result = db.execute(
                            "SELECT Video.id,Video.title,Channel.title FROM Video "
                            "LEFT JOIN Channel ON Video.channelId=Channel.id "
                            "WHERE Video.disabled=? AND Video.syncStatus=? AND Video.publishStatus=? "
                            f"ORDER BY Video.{order_key} DESC LIMIT 25",
                            (0, "Full", "Published"),
                        ).fetchall()
                    finally:
                        db.set_progress_handler(None, 0)
                    expected = [i for i in range(31000, 1, -1) if i % 10][:25]
                    self.assertEqual([row[0] for row in result], expected)

    def test_latest_ingested_videos_use_created_at_index(self):
        with closing(database()) as db:
            db.executemany(
                "INSERT INTO Video(id,youtubeId,createdAt) VALUES(?,?,?)",
                [(i, str(i), f"2026-{i:06d}") for i in range(1, 31001)],
            )
            steps = 0

            def progress():
                nonlocal steps
                steps += 1000
                return steps > 100_000

            db.set_progress_handler(progress, 1000)
            try:
                rows = db.execute(
                    "SELECT id,title,publishedAt,createdAt FROM Video "
                    "ORDER BY createdAt DESC LIMIT 5000"
                ).fetchall()
            finally:
                db.set_progress_handler(None, 0)
            self.assertEqual([row[0] for row in rows], list(range(31000, 26000, -1)))


if __name__ == "__main__":
    unittest.main()
