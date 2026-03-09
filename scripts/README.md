# DB Scripts

## Import dump.sql into local D1 sqlite

1) Create a local SQLite file for D1 (example: `./.d1/local.db`).
2) Run:

```bash
D1_LOCAL_DB=./.d1/local.db ./scripts/import-dump.sh
```

## Validate tables + counts

```bash
D1_LOCAL_DB=./.d1/local.db pnpm db:validate
```
