'use strict';

import path from 'path';
import { execSync } from 'child_process';
import { cleanDockerEnv } from './shared.js';

// ============================================
// 設定
// ============================================

/** webshop ディレクトリ */
const WEBSHOP_DIR = path.resolve(process.cwd(), 'apps', 'webshop');

/** Heroku アプリケーション名 */
const HEROKU_APP = process.env.HEROKU_APP || 'sdd-case-study-take3';

/** Heroku Container Registry */
const HEROKU_REGISTRY = `registry.heroku.com/${HEROKU_APP}`;

// ============================================
// ヘルパー関数
// ============================================

/**
 * webshop ディレクトリでコマンドを実行する
 * @param {string} command - 実行するコマンド
 * @param {object} [options] - オプション
 */
function webshopExec(command, options = {}) {
  try {
    execSync(command, {
      cwd: WEBSHOP_DIR,
      stdio: 'inherit',
      env: cleanDockerEnv(),
    });
  } catch (err) {
    if (!options.ignoreError) {
      throw err;
    }
  }
}

/**
 * プロジェクトルートでコマンドを実行する
 * Heroku CLI の container:login / container:release は内部で Docker を使用するため
 * DOCKER_HOST を除外した環境変数を使用する
 * @param {string} command - 実行するコマンド
 */
function rootExec(command) {
  execSync(command, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: cleanDockerEnv(),
  });
}

// ============================================
// Gulp タスク
// ============================================

/**
 * Heroku デプロイタスクを gulp に登録する
 * @param {import('gulp').Gulp} gulp - Gulp インスタンス
 */
export default function (gulp) {
  // ------------------------------------------
  // Heroku Container Registry ログイン
  // ------------------------------------------

  gulp.task('heroku:login', (done) => {
    try {
      console.log('Logging in to Heroku Container Registry...');
      rootExec('heroku container:login');
      console.log('Login successful.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // Docker イメージビルド
  // ------------------------------------------

  gulp.task('heroku:build', (done) => {
    try {
      console.log(`Building Docker image for ${HEROKU_APP}...`);
      webshopExec(`docker build --provenance=false -t ${HEROKU_REGISTRY}/web .`);
      console.log('Build completed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // Heroku Container Registry へプッシュ
  // ------------------------------------------

  gulp.task('heroku:push', (done) => {
    try {
      console.log(`Pushing image to ${HEROKU_REGISTRY}/web...`);
      webshopExec(`docker push ${HEROKU_REGISTRY}/web`);
      console.log('Push completed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // Heroku Container リリース
  // ------------------------------------------

  gulp.task('heroku:release', (done) => {
    try {
      console.log(`Releasing ${HEROKU_APP}...`);
      rootExec(`heroku container:release web --app ${HEROKU_APP}`);
      console.log('Release completed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // 一括デプロイ（ビルド → プッシュ → リリース）
  // ------------------------------------------

  gulp.task(
    'heroku:deploy',
    gulp.series('heroku:login', 'heroku:build', 'heroku:push', 'heroku:release')
  );

  // ------------------------------------------
  // 初回セットアップ
  // ------------------------------------------

  gulp.task('heroku:setup', (done) => {
    try {
      console.log(`Setting up Heroku app: ${HEROKU_APP}...`);

      console.log('Creating Heroku app...');
      rootExec(`heroku create ${HEROKU_APP} --stack container`);

      console.log('Setting environment variables...');
      rootExec(
        `heroku config:set DJANGO_DEBUG=False DJANGO_ALLOWED_HOSTS=.herokuapp.com "DJANGO_CSRF_TRUSTED_ORIGINS=https://*.herokuapp.com" --app ${HEROKU_APP}`
      );

      console.log('Setup completed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // マイグレーション実行
  // ------------------------------------------

  gulp.task('heroku:migrate', (done) => {
    try {
      console.log('Running migrations on Heroku...');
      rootExec(`heroku run python manage.py migrate --run-syncdb --app ${HEROKU_APP}`);
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // シードデータ投入
  // ------------------------------------------

  gulp.task('heroku:seed', (done) => {
    try {
      console.log('Loading seed data on Heroku...');
      rootExec(`heroku run python manage.py seed --app ${HEROKU_APP}`);
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // ステータス確認
  // ------------------------------------------

  gulp.task('heroku:status', (done) => {
    try {
      console.log(`\n=== ${HEROKU_APP} Status ===\n`);
      rootExec(`heroku ps --app ${HEROKU_APP}`);
      console.log('');
      rootExec(`heroku config --app ${HEROKU_APP}`);
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // ログ確認
  // ------------------------------------------

  gulp.task('heroku:logs', (done) => {
    try {
      rootExec(`heroku logs --tail --app ${HEROKU_APP}`);
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // アプリを開く
  // ------------------------------------------

  gulp.task('heroku:open', (done) => {
    try {
      rootExec(`heroku open --app ${HEROKU_APP}`);
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // 環境クリーンアップ
  // ------------------------------------------

  gulp.task('heroku:destroy', (done) => {
    try {
      console.log(`Destroying ${HEROKU_APP}...`);
      rootExec(`heroku apps:destroy ${HEROKU_APP} --confirm ${HEROKU_APP}`);
      console.log('App destroyed.');
      done();
    } catch (error) {
      done(error);
    }
  });

  // ------------------------------------------
  // ヘルプ
  // ------------------------------------------

  gulp.task('heroku:help', (done) => {
    console.log(`
=== Heroku デプロイコマンド（${HEROKU_APP}） ===

  セットアップ:
    heroku:setup            初回セットアップ（アプリ作成 + 環境変数）
    heroku:login            Heroku Container Registry ログイン

  デプロイ:
    heroku:deploy           一括デプロイ（ビルド → プッシュ → リリース）
    heroku:build            Docker イメージビルド
    heroku:push             Container Registry へプッシュ
    heroku:release          コンテナリリース

  運用:
    heroku:migrate          マイグレーション実行
    heroku:seed             シードデータ投入
    heroku:status           ステータス確認
    heroku:logs             ログ確認（リアルタイム）
    heroku:open             ブラウザで開く

  クリーンアップ:
    heroku:destroy          アプリ削除

  環境変数:
    HEROKU_APP              アプリ名（デフォルト: ${HEROKU_APP}）
    `);
    done();
  });
}
