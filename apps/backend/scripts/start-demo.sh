#!/bin/bash
# デモ環境起動スクリプト（SQLite モード）
# Heroku の dyno 起動時に generate + migrate + seed → サーバー開始

set -e

export DB_PROVIDER=sqlite
export SQLITE_DB_PATH=./prisma/dev.db

echo "=== Demo mode (SQLite) ==="

# 古い DB ファイルを削除（エフェメラルなのでクリーンスタート）
rm -f "$SQLITE_DB_PATH"

# SQLite 用スキーマで Prisma Client を生成
echo "Generating Prisma Client (SQLite)..."
npx prisma generate --config=prisma.config.sqlite.ts

# マイグレーション適用
echo "Running migrations..."
npx prisma migrate deploy --config=prisma.config.sqlite.ts

# シードデータ投入
echo "Seeding demo data..."
npx tsx prisma/seed.ts

# サーバー起動
echo "Starting server..."
node dist/index.js
