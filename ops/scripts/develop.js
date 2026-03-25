'use strict';

import { execSync } from 'child_process';
import { cleanDockerEnv, isDockerAvailable } from './shared.js';

// ============================================
// 設定
// ============================================

const SERVICES = [
  {
    name: 'backend',
    label: 'バックエンド',
    devCommand: 'npm run dev --workspace @fleur-memoire/backend',
    testCommand: 'npm run test:watch --workspace @fleur-memoire/backend',
  },
  {
    name: 'frontend',
    label: 'フロントエンド',
    devCommand: 'npm run dev --workspace @fleur-memoire/frontend',
    testCommand: 'npm run test:watch --workspace @fleur-memoire/frontend',
  },
];

const DB_SERVICE = 'postgres';

// ============================================
// ヘルパー関数
// ============================================

/**
 * シェルコマンドを実行する
 * @param {string} command - 実行するコマンド
 */
function run(command) {
  execSync(command, { stdio: 'inherit', env: cleanDockerEnv() });
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

/**
 * docker compose を実行する
 * @param {string} args - docker compose に渡す引数
 */
function dockerCompose(args) {
  run(`docker compose ${args}`);
}

/**
 * 指定サービスの設定を返す
 * @param {string} name - サービス名
 * @returns {{ name: string, label: string, devCommand: string, testCommand: string }}
 */
function getService(name) {
  const service = SERVICES.find((item) => item.name === name);
  if (!service) {
    throw new Error(`Unknown service: ${name}`);
  }
  return service;
}

/**
 * 開発サーバーを起動する
 * @param {string} name - サービス名
 */
function runDev(name) {
  const service = getService(name);
  console.log(`=== ${service.label} を起動 ===`);
  run(service.devCommand);
}

/**
 * TDD ウォッチを起動する
 * @param {string} name - サービス名
 */
function runTdd(name) {
  const service = getService(name);
  console.log(`=== ${service.label} の TDD ウォッチを起動 ===`);
  run(service.testCommand);
}

// ============================================
// Gulp タスク
// ============================================

/**
 * 開発タスクを gulp に登録する
 * @param {import('gulp').Gulp} gulp - Gulp インスタンス
 */
export default function developTasks(gulp) {
  SERVICES.forEach((service) => {
    gulp.task(`dev:${service.name}`, (done) => {
      try {
        runDev(service.name);
        done();
      } catch (error) {
        done(error);
      }
    });

    gulp.task(`tdd:${service.name}`, (done) => {
      try {
        runTdd(service.name);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  gulp.task('dev:db:start', (done) => {
    if (!requireDocker()) { done(); return; }
    try {
      console.log('=== PostgreSQL を起動 ===');
      dockerCompose(`up -d ${DB_SERVICE}`);
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:db:stop', (done) => {
    if (!requireDocker()) { done(); return; }
    try {
      console.log('=== PostgreSQL を停止 ===');
      dockerCompose(`stop ${DB_SERVICE}`);
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:db:status', (done) => {
    if (!requireDocker()) { done(); return; }
    try {
      console.log('=== PostgreSQL の状態 ===');
      dockerCompose(`ps ${DB_SERVICE}`);
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('dev:help', (done) => {
    console.log(`
ローカル開発タスク一覧
======================

  dev:backend        バックエンド開発サーバーを起動
  dev:frontend       フロントエンド開発サーバーを起動
  dev:db:start       PostgreSQL コンテナを起動
  dev:db:stop        PostgreSQL コンテナを停止
  dev:db:status      PostgreSQL コンテナの状態を確認
  tdd:backend        バックエンドの Vitest watch を起動
  tdd:frontend       フロントエンドの Vitest watch を起動
  dev:help           このヘルプを表示
`);
    done();
  });
}
