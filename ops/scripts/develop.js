'use strict';

import { execSync } from 'child_process';
import path from 'path';

// ============================================
// 設定
// ============================================

const ROOT_DIR = process.cwd();
const WEBSHOP_BACKEND_DIR = path.join(ROOT_DIR, 'apps', 'webshop', 'backend');
const WEBSHOP_FRONTEND_DIR = path.join(ROOT_DIR, 'apps', 'webshop', 'frontend');

// ============================================
// ヘルパー関数
// ============================================

/**
 * 指定ディレクトリでコマンドを実行する
 * @param {string} command - 実行コマンド
 * @param {string} cwd - 実行ディレクトリ
 */
function runCommand(command, cwd) {
  execSync(command, { cwd, stdio: 'inherit' });
}

// ============================================
// Gulp タスク
// ============================================

/**
 * 開発用タスクを gulp に登録する
 * @param {import('gulp').Gulp} gulp - Gulp インスタンス
 */
export default function developTasks(gulp) {
  gulp.task('develop:local:backend', (done) => {
    try {
      runCommand('./gradlew bootRun', WEBSHOP_BACKEND_DIR);
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('develop:local:frontend', (done) => {
    try {
      runCommand('npm run dev', WEBSHOP_FRONTEND_DIR);
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('develop:local:test:backend', (done) => {
    try {
      runCommand('./gradlew test', WEBSHOP_BACKEND_DIR);
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('develop:local:test:frontend', (done) => {
    try {
      runCommand('npm test', WEBSHOP_FRONTEND_DIR);
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task(
    'develop:local:test',
    gulp.parallel('develop:local:test:backend', 'develop:local:test:frontend')
  );

  gulp.task('develop:help', (done) => {
    console.log(`
=== 開発タスク一覧 ===

  develop:local:backend        Webshop バックエンド起動（Spring Boot）
  develop:local:frontend       Webshop フロントエンド起動（Vite）
  develop:local:test:backend   Webshop バックエンドテスト実行
  develop:local:test:frontend  Webshop フロントエンドテスト実行
  develop:local:test           Webshop テスト一括実行
  develop:help                 このヘルプを表示
`);
    done();
  });
}
