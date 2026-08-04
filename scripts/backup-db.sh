#!/usr/bin/env bash
# Backup DB + data apu-webid-next. Jalan tiap hari via systemd user timer.
set -euo pipefail

SRC="$HOME/projects/apu-webid-next/data"
DST="$HOME/Backups/apu-webid-next"
KEEP=14

mkdir -p "$DST"
stamp=$(date +%Y%m%d_%H%M%S)
for f in "$SRC"/*.db "$SRC"/*.db-wal "$SRC"/*.json; do
  [ -e "$f" ] || continue
  # SQLite WAL: copy pakai sqlite3 biar konsisten; fallback cp kalau gak ada sqlite3
  if [[ "$f" == *.db ]] && command -v sqlite3 >/dev/null; then
    sqlite3 "$f" ".backup '$DST/$(basename "$f" .db)_$stamp.db'" 2>/dev/null || cp "$f" "$DST/$(basename "$f")_$stamp"
  else
    cp "$f" "$DST/$(basename "$f")_$stamp"
  fi
done

# pruning: sisakan KEEP backup terbaru per pola
ls -1t "$DST" | tail -n +$((KEEP + 1)) | while read -r old; do rm -f "$DST/$old"; done
echo "backup done: $DST ($(ls -1 "$DST" | wc -l) files)"
