'use strict';

import path from 'path';
import { execSync } from 'child_process';
import { cleanDockerEnv, isDockerAvailable } from './shared.js';

// ============================================
// 設定
// ============================================

const APPS_DIR = path.resolve('apps');
const BACKEND_DIR = path.resolve('apps/backend');
const FRONTEND_DIR = path.resolve('apps/frontend');
const COMPOSE_FILE = path.join(APPS_DIR, 'docker-compose.yml');

/** ローカル開発用 DATABASE_URL（Docker Compose の DB に接続） */
const DEV_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev';

/** サービス定義 */
const SERVICES = [
  { name: 'backend', dir: BACKEND_DIR, port: 8080, label: 'バックエンド' },
  { name: 'frontend', dir: FRONTEND_DIR, port: 3000, label: 'フロントエンド' },
];

// ============================================
// ヘルパー関数
// ============================================

/**
 * Docker Compose コマンドを実行する
 * DOCKER_HOST を除外した環境変数を使用する
 * @param {string} subcommand - docker compose のサブコマンド
 * @param {object} [options] - オプション
 * @param {boolean} [options.silent] - 出力を抑制するか
 */
function compose(subcommand, options = {}) {
  const stdio = options.silent ? 'ignore' : 'inherit';
  execSync(`docker compose -f "${COMPOSE_FILE}" ${subcommand}`, {
    stdio,
    env: cleanDockerEnv(),
  });
}

/**
 * サブプロジェクトで npm コマンドを実行する
 * @param {string} dir - サブプロジェクトのディレクトリ
 * @param {string} script - npm script 名
 */
function npmRun(dir, script) {
  execSync(`npm run ${script}`, {
    cwd: dir,
    stdio: 'inherit',
    env: cleanDockerEnv(),
  });
}

/**
 * サブプロジェクトで npx コマンドを実行する
 * @param {string} dir - サブプロジェクトのディレクトリ
 * @param {string} command - npx コマンド
 * @param {object} [extraEnv] - 追加の環境変数
 */
function npxRun(dir, command, extraEnv = {}) {
  execSync(`npx ${command}`, {
    cwd: dir,
    stdio: 'inherit',
    env: { ...cleanDockerEnv(), ...extraEnv },
  });
}

/**
 * Docker が利用可能であることを確認し、利用不可なら終了する
 */
function requireDocker() {
  if (!isDockerAvailable()) {
    console.error('エラー: Docker が利用できません。Docker Desktop を起動してください。');
    process.exit(1);
  }
}

// ============================================
// Gulp タスク
// ============================================

export default function (gulp) {

  // ------------------------------------------
  // データベース
  // ------------------------------------------

  gulp.task('dev:db:start', (done) => {
    requireDocker();
    console.log('データベースを起動します...');
    compose('up -d db');
    console.log('PostgreSQL が起動しました (localhost:5432)');
    done();
  });

  gulp.task('dev:db:stop', (done) => {
    requireDocker();
    console.log('データベースを停止します...');
    compose('down');
    done();
  });

  gulp.task('dev:db:status', (done) => {
    requireDocker();
    compose('ps');
    done();
  });

  gulp.task('dev:db:logs', (done) => {
    requireDocker();
    compose('logs -f db');
    done();
  });

  // ------------------------------------------
  // Prisma（マイグレーション・シード）
  // ------------------------------------------

  gulp.task('dev:migrate', (done) => {
    console.log('マイグレーションを実行します...');
    npxRun(BACKEND_DIR, 'prisma migrate dev', { DATABASE_URL: DEV_DATABASE_URL });
    done();
  });

  gulp.task('dev:migrate:reset', (done) => {
    console.log('データベースをリセットします...');
    npxRun(BACKEND_DIR, 'prisma migrate reset --force', { DATABASE_URL: DEV_DATABASE_URL });
    done();
  });

  gulp.task('dev:seed', (done) => {
    console.log('シードデータを投入します...');
    npxRun(BACKEND_DIR, 'prisma db seed', { DATABASE_URL: DEV_DATABASE_URL });
    done();
  });

  gulp.task('dev:prisma:generate', (done) => {
    console.log('Prisma Client を生成します...');
    npxRun(BACKEND_DIR, 'prisma generate', { DATABASE_URL: DEV_DATABASE_URL });
    done();
  });

  // ------------------------------------------
  // 開発サーバー
  // ------------------------------------------

  gulp.task('dev:backend', (done) => {
    console.log('バックエンド開発サーバーを起動します (localhost:8080)...');
    npmRun(BACKEND_DIR, 'dev');
    done();
  });

  gulp.task('dev:frontend', (done) => {
    console.log('フロントエンド開発サーバーを起動します (localhost:3000)...');
    npmRun(FRONTEND_DIR, 'dev');
    done();
  });

  // ------------------------------------------
  // テスト
  // ------------------------------------------

  gulp.task('test:backend', (done) => {
    console.log('バックエンドテストを実行します...');
    npmRun(BACKEND_DIR, 'test');
    done();
  });

  gulp.task('test:frontend', (done) => {
    console.log('フロントエンドテストを実行します...');
    npmRun(FRONTEND_DIR, 'test');
    done();
  });

  gulp.task('test', gulp.series('test:backend', 'test:frontend'));

  // ------------------------------------------
  // TDD モード
  // ------------------------------------------

  gulp.task('tdd:backend', (done) => {
    console.log('バックエンド TDD モードを開始します...');
    npmRun(BACKEND_DIR, 'test:watch');
    done();
  });

  gulp.task('tdd:frontend', (done) => {
    console.log('フロントエンド TDD モードを開始します...');
    npmRun(FRONTEND_DIR, 'test:watch');
    done();
  });

  // ------------------------------------------
  // カバレッジ
  // ------------------------------------------

  gulp.task('coverage:backend', (done) => {
    console.log('バックエンドカバレッジを計測します...');
    npmRun(BACKEND_DIR, 'test:coverage');
    done();
  });

  gulp.task('coverage:frontend', (done) => {
    console.log('フロントエンドカバレッジを計測します...');
    npmRun(FRONTEND_DIR, 'test:coverage');
    done();
  });

  gulp.task('coverage', gulp.series('coverage:backend', 'coverage:frontend'));

  // ------------------------------------------
  // 品質チェック
  // ------------------------------------------

  gulp.task('lint:backend', (done) => {
    console.log('バックエンド Lint を実行します...');
    npmRun(BACKEND_DIR, 'lint');
    done();
  });

  gulp.task('lint:frontend', (done) => {
    console.log('フロントエンド Lint を実行します...');
    npmRun(FRONTEND_DIR, 'lint');
    done();
  });

  gulp.task('lint', gulp.series('lint:backend', 'lint:frontend'));

  gulp.task('type-check:backend', (done) => {
    console.log('バックエンド型チェックを実行します...');
    npmRun(BACKEND_DIR, 'type-check');
    done();
  });

  gulp.task('type-check:frontend', (done) => {
    console.log('フロントエンド型チェックを実行します...');
    npmRun(FRONTEND_DIR, 'type-check');
    done();
  });

  gulp.task('type-check', gulp.series('type-check:backend', 'type-check:frontend'));

  gulp.task('check', gulp.series('lint', 'type-check', 'test'));

  // ------------------------------------------
  // セットアップ
  // ------------------------------------------

  gulp.task('dev:install', (done) => {
    console.log('バックエンドの依存パッケージをインストールします...');
    execSync('npm install', {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      env: cleanDockerEnv(),
    });
    console.log('フロントエンドの依存パッケージをインストールします...');
    execSync('npm install', {
      cwd: FRONTEND_DIR,
      stdio: 'inherit',
      env: cleanDockerEnv(),
    });
    done();
  });

  gulp.task('dev:setup', gulp.series(
    'dev:install',
    'dev:db:start',
    'dev:prisma:generate',
    'dev:migrate',
    'dev:seed',
    'test:backend',
    'test:frontend',
  ));

  // ------------------------------------------
  // ヘルプ
  // ------------------------------------------

  gulp.task('dev:help', (done) => {
    console.log(`
=== アプリケーション開発コマンド ===

  データベース:
    dev:db:start          PostgreSQL を起動
    dev:db:stop           PostgreSQL を停止
    dev:db:status         コンテナ状態を確認
    dev:db:logs           データベースログを表示

  Prisma:
    dev:migrate           マイグレーションを実行
    dev:migrate:reset     データベースをリセット
    dev:seed              シードデータを投入
    dev:prisma:generate   Prisma Client を生成

  開発サーバー:
    dev:backend           バックエンド開発サーバーを起動 (localhost:8080)
    dev:frontend          フロントエンド開発サーバーを起動 (localhost:3000)

  テスト:
    test                  全テストを実行
    test:backend          バックエンドテストを実行
    test:frontend         フロントエンドテストを実行

  TDD モード:
    tdd:backend           バックエンド TDD モード（ウォッチ）
    tdd:frontend          フロントエンド TDD モード（ウォッチ）

  カバレッジ:
    coverage              全カバレッジを計測
    coverage:backend      バックエンドカバレッジを計測
    coverage:frontend     フロントエンドカバレッジを計測

  品質チェック:
    lint                  全 Lint を実行
    type-check            全型チェックを実行
    check                 Lint + 型チェック + テスト（CI 相当）

  セットアップ:
    dev:setup             初回セットアップ（依存インストール→DB起動→Prisma生成→マイグレーション→シード→テスト）

  ヘルプ:
    dev:help              このヘルプを表示
`);
    done();
  });
}
