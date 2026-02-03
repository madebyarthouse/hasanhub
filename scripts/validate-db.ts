const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
};

const DB_PATH = requireEnv("D1_LOCAL_DB");

const run = async () => {
  const sqlite = await import("better-sqlite3");
  const Database = sqlite.default;
  const db = new Database(DB_PATH);

  const rows = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();
  const tables = rows.map((row: any) => row.name).sort();

  const counts = tables.reduce((acc: Record<string, number>, table: string) => {
    const count = db.prepare(`SELECT count(*) as count FROM ${table}`).get().count;
    acc[table] = count;
    return acc;
  }, {});

  console.log(JSON.stringify({ tables, counts }, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
