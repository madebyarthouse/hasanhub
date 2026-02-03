#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${D1_LOCAL_DB:-}" ]]; then
  echo "D1_LOCAL_DB is required (path to local .sqlite file)." >&2
  exit 1
fi

if [[ ! -f "${D1_LOCAL_DB}" ]]; then
  echo "Local DB not found at ${D1_LOCAL_DB}" >&2
  exit 1
fi

if [[ ! -f "dump.sql" ]]; then
  echo "dump.sql not found in repo root" >&2
  exit 1
fi

sqlite3 "${D1_LOCAL_DB}" < dump.sql

echo "Import complete."
