'use strict';

import path from 'path';
import { execSync } from 'child_process';
import { cleanDockerEnv, isDockerAvailable } from './shared.js';

// ============================================
// 設定
// ============================================

/** webshop docker-compose ディレクトリ */
const WEBSHOP_DIR = 'apps/webshop';

/** バックエンドディレクトリ */
const BACKEND_DIR = 'apps/webshop/backend';

/** フロントエンドディレクトリ */
const FRONTEND_DIR = 'apps/webshop/frontend';

// ============================================
// ヘルパー関数
// ============================================

/**
 * Docker が利用可能か確認し、不可なら警告メッセージを表示して false を返す
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

/**
 * webshop の docker compose コマンドを実行
 * @param {string} args - docker compose に渡す引数
 */
function dockerCompose(args) {
  const cwd = path.join(process.cwd(), WEBSHOP_DIR);
  execSync(`docker compose ${args}`, { stdio: 'inherit', cwd, env: cleanDockerEnv() });
}

/**
 * ローカルコマンドを実行する
 * @param {string} command - 実行するコマンド
 * @param {object} [opts] - オプション
 * @param {string} [opts.cwd] - 作業ディレクトリ（プロジェクトルートからの相対パス）
 * @param {boolean} [opts.ignoreError] - エラーを無視するか
 */
function localExec(command, opts = {}) {
  const cwd = opts.cwd ? path.join(process.cwd(), opts.cwd) : process.cwd();
  execSync(command, { stdio: 'inherit', shell: true, cwd, env: cleanDockerEnv() });
}

// ============================================
// Gulp タスク
// ============================================

/**
 * アプリケーション開発タスクを gulp に登録する
 * @param {import('gulp').Gulp} gulp - Gulp インスタンス
 */
export default function (gulp) {

  // --- データベース ---

  gulp.task('dev:webshop:db', (done) => {
    if (!requireDocker()) { done(); return; }
    try {
      console.log('Starting webshop database...');
      dockerCompose('up -d db');
      console.log('\nPostgreSQL is available at localhost:5432');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:webshop:db:stop', (done) => {
    if (!requireDocker()) { done(); return; }
    try {
      console.log('Stopping webshop containers...');
      dockerCompose('down');
      console.log('Stopped.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // --- バックエンド ---

  gulp.task('dev:webshop:backend', (done) => {
    try {
      console.log('Starting webshop backend (default profile)...');
      localExec('./gradlew bootRun', { cwd: BACKEND_DIR });
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:webshop:backend:prod', (done) => {
    try {
      console.log('Starting webshop backend (prod profile)...');
      console.log('Note: PostgreSQL must be running. Use "gulp dev:webshop:db" to start.');
      localExec("./gradlew bootRun --args='--spring.profiles.active=prod'", { cwd: BACKEND_DIR });
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:webshop:backend:test', (done) => {
    try {
      console.log('Running webshop backend tests...');
      localExec('./gradlew test', { cwd: BACKEND_DIR });
      done();
    } catch (error) {
      done(error);
    }
  });

  // --- フロントエンド ---

  gulp.task('dev:webshop:frontend', (done) => {
    try {
      console.log('Starting webshop frontend dev server...');
      localExec('npm run dev', { cwd: FRONTEND_DIR });
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:webshop:frontend:test', (done) => {
    try {
      console.log('Running webshop frontend tests...');
      localExec('npm run test', { cwd: FRONTEND_DIR });
      done();
    } catch (error) {
      done(error);
    }
  });

  // --- TDD ---

  gulp.task('tdd:webshop:backend', (done) => {
    try {
      console.log('Starting webshop backend TDD mode (continuous test)...');
      localExec('./gradlew test --continuous', { cwd: BACKEND_DIR });
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('tdd:webshop:frontend', (done) => {
    try {
      console.log('Starting webshop frontend TDD mode (vitest watch)...');
      localExec('npm run test:watch', { cwd: FRONTEND_DIR });
      done();
    } catch (error) {
      done(error);
    }
  });

  // --- ビルド ---

  gulp.task('dev:webshop:build:backend', (done) => {
    try {
      console.log('Building webshop backend...');
      localExec('./gradlew build', { cwd: BACKEND_DIR });
      console.log('Backend build completed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:webshop:build:frontend', (done) => {
    try {
      console.log('Building webshop frontend...');
      localExec('npm run build', { cwd: FRONTEND_DIR });
      console.log('Frontend build completed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:webshop:build', gulp.series('dev:webshop:build:backend', 'dev:webshop:build:frontend'));

  // --- ヘルプ ---

  gulp.task('dev:help', (done) => {
    console.log(`
=== 開発タスク一覧 ===

データベース:
  dev:webshop:db              PostgreSQL データベースコンテナを起動
  dev:webshop:db:stop         データベースコンテナを停止

バックエンド:
  dev:webshop:backend         バックエンド開発サーバーを起動（default プロファイル）
  dev:webshop:backend:prod    バックエンド開発サーバーを起動（prod プロファイル）
  dev:webshop:backend:test    バックエンドテストを実行

フロントエンド:
  dev:webshop:frontend        フロントエンド開発サーバーを起動
  dev:webshop:frontend:test   フロントエンドテストを実行

TDD:
  tdd:webshop:backend         バックエンド TDD モード（テスト継続実行）
  tdd:webshop:frontend        フロントエンド TDD モード（vitest watch）

ビルド:
  dev:webshop:build           バックエンドとフロントエンドをビルド

ヘルプ:
  dev:help                    このヘルプを表示

--- 典型的な開発フロー ---

日常開発（H2 インメモリ DB）:
  1. npx gulp dev:webshop:backend          # バックエンド起動
  2. npx gulp dev:webshop:frontend         # フロントエンド起動

本番互換テスト（PostgreSQL）:
  1. npx gulp dev:webshop:db               # PostgreSQL を起動
  2. npx gulp dev:webshop:backend:prod     # prod プロファイルで起動
  3. npx gulp dev:webshop:frontend         # フロントエンド起動

TDD:
  1. npx gulp tdd:webshop:backend          # バックエンド TDD
  2. npx gulp tdd:webshop:frontend         # フロントエンド TDD
`);
    done();
  });
}
