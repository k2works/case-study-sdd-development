'use strict';

import path from 'path';
import { execSync } from 'child_process';
import { cleanDockerEnv, isDockerAvailable } from './shared.js';

// ============================================
// 設定
// ============================================

/** アプリケーションルートディレクトリ */
const APP_ROOT = path.resolve(process.cwd(), 'apps', 'webshop');

/** Django 管理コマンドのプレフィックス */
const MANAGE = 'uv run python manage.py';

/** デフォルトのサーバーポート（8000 は mkdocs が使用） */
const DEFAULT_PORT = 8001;

// ============================================
// ヘルパー関数
// ============================================

/**
 * アプリケーションディレクトリでコマンドを実行する
 * @param {string} command - 実行するコマンド
 * @param {object} [options] - オプション
 * @param {boolean} [options.ignoreError] - エラーを無視するか
 * @returns {string|undefined} capture 時は標準出力
 */
function appExec(command, options = {}) {
  try {
    execSync(command, {
      cwd: APP_ROOT,
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (err) {
    if (!options.ignoreError) {
      throw err;
    }
  }
}

/**
 * Docker Compose をアプリケーションディレクトリで実行する
 * @param {string} args - docker compose に渡す引数
 */
function dockerCompose(args) {
  execSync(`docker compose ${args}`, {
    cwd: APP_ROOT,
    stdio: 'inherit',
    env: cleanDockerEnv(),
  });
}

/**
 * Docker が利用可能か確認し、不可なら警告を表示する
 * @returns {boolean} Docker が利用可能なら true
 */
function requireDocker() {
  if (isDockerAvailable()) {
    return true;
  }
  console.warn('Warning: Docker is not running. Skipping this task.');
  console.warn('Please start Docker Desktop and try again.');
  return false;
}

// ============================================
// Gulp タスク
// ============================================

/**
 * アプリケーション開発タスクを gulp に登録する
 * @param {import('gulp').Gulp} gulp - Gulp インスタンス
 */
export default function (gulp) {
  // ------------------------------------------
  // 開発サーバー
  // ------------------------------------------

  gulp.task('dev:server', (done) => {
    try {
      console.log('Applying migrations...');
      appExec(`${MANAGE} migrate --run-syncdb`);
      console.log('Loading seed data...');
      appExec(`${MANAGE} seed`);
      console.log('Starting Django development server...');
      appExec(`${MANAGE} runserver ${DEFAULT_PORT}`);
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:server:product', (done) => {
    if (!requireDocker()) { done(); return; }
    try {
      console.log('Starting PostgreSQL...');
      dockerCompose('up -d db');
      const productEnv = {
        ...process.env,
        DB_ENGINE: 'django.db.backends.postgresql',
        DB_NAME: 'fleur_memoire',
        DB_USER: 'user',
        DB_PASSWORD: 'pass',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
      };
      const productExecOpts = { cwd: APP_ROOT, stdio: 'inherit', env: productEnv };
      console.log('Applying migrations...');
      execSync(`${MANAGE} migrate --run-syncdb`, productExecOpts);
      console.log('Loading seed data...');
      execSync(`${MANAGE} seed`, productExecOpts);
      console.log('Starting Django development server (product profile)...');
      execSync(`${MANAGE} runserver ${DEFAULT_PORT}`, productExecOpts);
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // テスト
  // ------------------------------------------

  gulp.task('tdd:backend', (done) => {
    try {
      console.log('Running pytest in watch mode...');
      appExec('uv run pytest -f --tb=short');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:test', (done) => {
    try {
      console.log('Running test suite...');
      appExec('uv run pytest --cov=apps --cov-report=term-missing -v');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:test:fast', (done) => {
    try {
      console.log('Running test suite (no coverage)...');
      appExec('uv run pytest --tb=short -q');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // 品質チェック
  // ------------------------------------------

  gulp.task('dev:lint', (done) => {
    try {
      console.log('Running Ruff linter...');
      appExec('uv run ruff check .');
      console.log('Checking format...');
      appExec('uv run ruff format --check .');
      console.log('Lint passed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:format', (done) => {
    try {
      console.log('Formatting code with Ruff...');
      appExec('uv run ruff check --fix .');
      appExec('uv run ruff format .');
      console.log('Format completed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:type', (done) => {
    try {
      console.log('Running mypy type check...');
      appExec('uv run mypy apps --ignore-missing-imports');
      console.log('Type check passed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:security', (done) => {
    try {
      console.log('Running security scan...');
      appExec('uv run bandit -r apps -q');
      appExec('uv run pip-audit');
      console.log('Security scan passed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:tox', (done) => {
    try {
      console.log('Running tox (test + lint + type)...');
      appExec('uv run tox');
      console.log('All tox environments passed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // データベース
  // ------------------------------------------

  gulp.task('dev:db:start', (done) => {
    if (!requireDocker()) { done(); return; }
    try {
      console.log('Starting PostgreSQL...');
      dockerCompose('up -d db');
      console.log('PostgreSQL is running on port 5432.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:db:stop', (done) => {
    if (!requireDocker()) { done(); return; }
    try {
      console.log('Stopping PostgreSQL...');
      dockerCompose('down');
      console.log('PostgreSQL stopped.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:db:migrate', (done) => {
    try {
      console.log('Running migrations...');
      appExec(`${MANAGE} migrate`);
      console.log('Migrations applied.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:db:makemigrations', (done) => {
    try {
      console.log('Creating migrations...');
      appExec(`${MANAGE} makemigrations`);
      console.log('Migrations created.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:db:reset', (done) => {
    try {
      console.log('Resetting database (flush)...');
      appExec(`${MANAGE} flush --no-input`);
      console.log('Database reset.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // セットアップ
  // ------------------------------------------

  gulp.task('dev:setup', (done) => {
    try {
      console.log('Installing dependencies...');
      execSync('uv sync', { cwd: APP_ROOT, stdio: 'inherit' });
      console.log('Running migrations...');
      appExec(`${MANAGE} migrate`);
      console.log('\nSetup completed. Run "npx gulp dev:server" to start.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // ヘルプ
  // ------------------------------------------

  gulp.task('dev:help', (done) => {
    console.log(`
=== アプリケーション開発コマンド ===

  サーバー（http://localhost:8001）:
    dev:server              Django 開発サーバー起動（SQLite）
    dev:server:product      Django 開発サーバー起動（PostgreSQL）
    dev:setup               依存関係インストール + マイグレーション

  テスト:
    tdd:backend             pytest watch モード（TDD）
    dev:test                テスト実行（カバレッジ付き）
    dev:test:fast           テスト実行（カバレッジなし・高速）

  品質チェック:
    dev:lint                Ruff lint + format チェック
    dev:format              Ruff 自動フォーマット
    dev:type                mypy 型チェック
    dev:security            bandit + pip-audit セキュリティスキャン
    dev:tox                 tox 全環境実行（test + lint + type）

  データベース:
    dev:db:start            PostgreSQL 起動（Docker）
    dev:db:stop             PostgreSQL 停止
    dev:db:migrate          マイグレーション適用
    dev:db:makemigrations   マイグレーション作成
    dev:db:reset            データベースリセット

    `);
    done();
  });
}
