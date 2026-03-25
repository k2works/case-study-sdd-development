# ============================================
# フレール・メモワール WEB ショップ - デモ用 Dockerfile
# Heroku Container Registry 対応（SQLite）
# ============================================

FROM python:3.12-slim AS base

# 環境変数
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1

# uv のインストール
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# 作業ディレクトリ
WORKDIR /app

# 依存関係のインストール（キャッシュ活用）
COPY pyproject.toml uv.lock* ./
RUN uv pip install --system -r pyproject.toml

# アプリケーションコードのコピー
COPY . .

# 静的ファイルの収集
RUN python manage.py collectstatic --noinput

# 起動スクリプト: Heroku の ephemeral filesystem では
# SQLite DB が再起動のたびにリセットされるため毎回初期化する
CMD sh -c "python manage.py migrate --run-syncdb && python manage.py seed && gunicorn config.wsgi:application --bind 0.0.0.0:\${PORT:-8000} --workers 2 --threads 2 --timeout 120"
