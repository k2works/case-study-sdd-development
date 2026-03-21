'use strict';

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { cleanDockerEnv, isDockerAvailable, wrapWithJava } from './shared.js';

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

/**
 * Java が必要なローカルコマンドを実行する
 * Java が未インストールの場合、Nix 経由で透過的に実行する
 * @param {string} command - 実行するコマンド
 * @param {object} [opts] - オプション
 * @param {string} [opts.cwd] - 作業ディレクトリ（プロジェクトルートからの相対パス）
 */
function javaExec(command, opts = {}) {
  const cwd = opts.cwd ? path.join(process.cwd(), opts.cwd) : process.cwd();
  const wrappedCommand = wrapWithJava(command);
  execSync(wrappedCommand, { stdio: 'inherit', shell: true, cwd, env: cleanDockerEnv() });
}

/**
 * .env ファイルが存在しなければ .env.example からコピーする
 */
function copyEnvIfNeeded() {
  const envPath = path.join(process.cwd(), '.env');
  const examplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(envPath)) {
    console.log('.env already exists. Skipping.');
    return;
  }
  if (!fs.existsSync(examplePath)) {
    console.warn('.env.example not found. Skipping .env creation.');
    return;
  }
  fs.copyFileSync(examplePath, envPath);
  console.log('.env created from .env.example');
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
      javaExec('./gradlew bootRun', { cwd: BACKEND_DIR });
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:webshop:backend:prod', (done) => {
    try {
      console.log('Starting webshop backend (prod profile)...');
      console.log('Note: PostgreSQL must be running. Use "gulp dev:webshop:db" to start.');
      javaExec("./gradlew bootRun --args='--spring.profiles.active=prod'", { cwd: BACKEND_DIR });
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:webshop:backend:test', (done) => {
    try {
      console.log('Running webshop backend tests...');
      javaExec('./gradlew test', { cwd: BACKEND_DIR });
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
      javaExec('./gradlew test --continuous', { cwd: BACKEND_DIR });
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
      javaExec('./gradlew build', { cwd: BACKEND_DIR });
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

  // --- セットアップ ---

  gulp.task('setup:webshop:env', (done) => {
    try {
      console.log('Checking .env file...');
      copyEnvIfNeeded();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('setup:webshop:root', (done) => {
    try {
      console.log('Installing root dependencies...');
      localExec('npm install');
      console.log('Root dependencies installed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('setup:webshop:frontend:install', (done) => {
    try {
      console.log('Installing frontend dependencies...');
      localExec('npm install', { cwd: FRONTEND_DIR });
      console.log('Frontend dependencies installed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('setup:webshop:backend:build', (done) => {
    try {
      console.log('Building and testing backend...');
      javaExec('./gradlew build', { cwd: BACKEND_DIR });
      console.log('Backend build completed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('setup:webshop:frontend:build', (done) => {
    try {
      console.log('Building frontend...');
      localExec('npm run build', { cwd: FRONTEND_DIR });
      console.log('Frontend build completed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('setup:webshop', gulp.series(
    'setup:webshop:env',
    'setup:webshop:root',
    'setup:webshop:frontend:install',
    'setup:webshop:backend:build',
    'setup:webshop:frontend:build'
  ));

  // --- 品質チェック ---

  gulp.task('check:frontend', (done) => {
    try {
      console.log('Running frontend quality checks...');
      console.log('\n[1/3] ESLint...');
      localExec('npm run lint', { cwd: FRONTEND_DIR });
      console.log('\n[2/3] TypeScript type check...');
      localExec('npx tsc --noEmit', { cwd: FRONTEND_DIR });
      console.log('\n[3/3] Unit tests...');
      localExec('npm run test', { cwd: FRONTEND_DIR });
      console.log('\nFrontend quality checks passed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('check:backend', (done) => {
    try {
      console.log('Running backend quality checks...');
      console.log('\n[1/3] Checkstyle...');
      javaExec('./gradlew checkstyleMain checkstyleTest', { cwd: BACKEND_DIR });
      console.log('\n[2/3] Unit tests...');
      javaExec('./gradlew test', { cwd: BACKEND_DIR });
      console.log('\n[3/3] Coverage verification...');
      javaExec('./gradlew jacocoTestCoverageVerification', { cwd: BACKEND_DIR });
      console.log('\nBackend quality checks passed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('check:all', gulp.series('check:backend', 'check:frontend'));

  // --- ヘルプ ---

  gulp.task('dev:help', (done) => {
    console.log(`
=== 開発タスク一覧 ===

セットアップ:
  setup:webshop               初回セットアップ（依存インストール＋ビルド＋テスト）

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

品質チェック:
  check:frontend              フロントエンド品質チェック（lint + 型検査 + テスト）
  check:backend               バックエンド品質チェック（checkstyle + テスト + カバレッジ）
  check:all                   全品質チェック（バックエンド → フロントエンド）

ヘルプ:
  dev:help                    このヘルプを表示

--- 典型的な開発フロー ---

初回セットアップ:
  1. npx gulp setup:webshop                # 依存インストール＋ビルド＋テスト

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
