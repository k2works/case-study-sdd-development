'use strict';

import { execSync } from 'child_process';
import { cleanDockerEnv } from './shared.js';

// ============================================
// 設定
// ============================================

const PREFIX = 'DEV';
const DEFAULT_HEROKU_APP = 'sdd-case-study-codex-take1';
const DEFAULT_HEROKU_STACK = 'container';
const DEFAULT_INTERNAL_API_PORT = '3000';
const DEFAULT_API_BASE_URL = '/api';
const HEROKU_IMAGE = 'sdd-case-study-codex-take1';
const DEFAULT_DOCKER_PLATFORM = 'linux/amd64';

// ============================================
// ヘルパー関数
// ============================================

/**
 * 環境変数から Heroku アプリ名を取得する
 * @returns {string} Heroku アプリ名
 */
function herokuApp() {
  return process.env[`${PREFIX}_HEROKU_APP`] || DEFAULT_HEROKU_APP;
}

/**
 * 環境変数から Heroku スタックを取得する
 * @returns {string} Heroku スタック
 */
function herokuStack() {
  return process.env[`${PREFIX}_HEROKU_STACK`] || DEFAULT_HEROKU_STACK;
}

/**
 * 環境変数から内部 API ポートを取得する
 * @returns {string} 内部 API ポート
 */
function internalApiPort() {
  return process.env[`${PREFIX}_INTERNAL_API_PORT`] || DEFAULT_INTERNAL_API_PORT;
}

/**
 * 環境変数から Frontend 用 API ベース URL を取得する
 * @returns {string} API ベース URL
 */
function apiBaseUrl() {
  return process.env[`${PREFIX}_NEXT_PUBLIC_API_BASE_URL`] || DEFAULT_API_BASE_URL;
}

/**
 * Heroku 向け Docker platform を取得する
 * @returns {string} Docker platform
 */
function dockerPlatform() {
  return process.env[`${PREFIX}_DOCKER_PLATFORM`] || DEFAULT_DOCKER_PLATFORM;
}

/**
 * シェルコマンドを実行する
 * @param {string} command - 実行するコマンド
 */
function run(command) {
  execSync(command, { stdio: 'inherit', env: cleanDockerEnv() });
}

/**
 * Heroku CLI コマンドを実行する
 * @param {string} args - Heroku CLI に渡す引数
 */
function heroku(args) {
  run(`heroku ${args}`);
}

/**
 * Heroku Container Registry の web イメージ名を返す
 * @returns {string} Registry 側のイメージ参照
 */
function herokuWebImage() {
  return `registry.heroku.com/${herokuApp()}/web`;
}

/**
 * Heroku アプリを作成する
 */
function createApp() {
  heroku(`create ${herokuApp()} --stack ${herokuStack()}`);
}

/**
 * Heroku アプリの stack を container にそろえる
 */
function setupStack() {
  heroku(`stack:set ${herokuStack()} --app ${herokuApp()}`);
}

/**
 * Heroku 環境変数を設定する
 */
function configureApp() {
  heroku(
    `config:set NEXT_PUBLIC_API_BASE_URL=${apiBaseUrl()} INTERNAL_API_PORT=${internalApiPort()} --app ${herokuApp()}`,
  );
}

/**
 * Heroku Container Registry へログインする
 */
function loginContainerRegistry() {
  heroku('container:login');
}

/**
 * Heroku 用イメージをローカル build する
 */
function buildImage() {
  run(
    `docker build --platform ${dockerPlatform()} --provenance=false --sbom=false -f Dockerfile.heroku -t ${HEROKU_IMAGE} .`,
  );
}

/**
 * Heroku Registry 向けにローカルイメージへタグを付ける
 */
function tagImage() {
  run(`docker tag ${HEROKU_IMAGE} ${herokuWebImage()}`);
}

/**
 * Heroku Container Registry へ web イメージを push する
 */
function pushImage() {
  run(`docker push ${herokuWebImage()}`);
}

/**
 * Heroku へ web イメージを release する
 */
function releaseImage() {
  heroku(`container:release web --app ${herokuApp()}`);
}

/**
 * アプリをブラウザで開く
 */
function openApp() {
  heroku(`open --app ${herokuApp()}`);
}

/**
 * アプリログを表示する
 */
function showLogs() {
  heroku(`logs --tail --app ${herokuApp()}`);
}

/**
 * アプリ情報を表示する
 */
function showStatus() {
  heroku(`apps:info --app ${herokuApp()}`);
}

// ============================================
// Gulp タスク
// ============================================

/**
 * 開発環境の Heroku デプロイタスクを gulp に登録する
 * @param {import('gulp').Gulp} gulp - Gulp インスタンス
 */
export default function deployDevTasks(gulp) {
  gulp.task('deploy:dev:create', (done) => {
    try {
      createApp();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('deploy:dev:stack', (done) => {
    try {
      setupStack();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('deploy:dev:config', (done) => {
    try {
      configureApp();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('deploy:dev:login', (done) => {
    try {
      loginContainerRegistry();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('deploy:dev:build', (done) => {
    try {
      buildImage();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('deploy:dev:push', (done) => {
    try {
      tagImage();
      pushImage();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('deploy:dev:release', (done) => {
    try {
      releaseImage();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('deploy:dev:open', (done) => {
    try {
      openApp();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('deploy:dev:logs', (done) => {
    try {
      showLogs();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task('deploy:dev:status', (done) => {
    try {
      showStatus();
      done();
    } catch (error) {
      done(error);
    }
  });

  gulp.task(
    'deploy:dev:setup',
    gulp.series('deploy:dev:create', 'deploy:dev:stack', 'deploy:dev:config'),
  );

  gulp.task(
    'deploy:dev',
    gulp.series(
      'deploy:dev:stack',
      'deploy:dev:config',
      'deploy:dev:login',
      'deploy:dev:build',
      'deploy:dev:push',
      'deploy:dev:release',
    ),
  );

  gulp.task('deploy:dev:help', (done) => {
    console.log(`
Heroku 開発環境デプロイタスク一覧
=================================

  deploy:dev:create    Heroku アプリを作成
  deploy:dev:stack     Heroku stack を container に設定
  deploy:dev:config    NEXT_PUBLIC_API_BASE_URL と INTERNAL_API_PORT を設定
  deploy:dev:login     Heroku Container Registry にログイン
  deploy:dev:build     Dockerfile.heroku で単一イメージを build
  deploy:dev:push      ローカルイメージを tag して Heroku Registry に push
  deploy:dev:release   web イメージを release
  deploy:dev:status    Heroku アプリ情報を表示
  deploy:dev:logs      Heroku ログを表示
  deploy:dev:open      Heroku アプリをブラウザで開く
  deploy:dev:setup     create + stack + config を一括実行
  deploy:dev           stack + config + login + build + push + release を一括実行
  deploy:dev:help      このヘルプを表示

環境変数
--------
  DEV_HEROKU_APP                  既定値: ${DEFAULT_HEROKU_APP}
  DEV_HEROKU_STACK                既定値: ${DEFAULT_HEROKU_STACK}
  DEV_INTERNAL_API_PORT           既定値: ${DEFAULT_INTERNAL_API_PORT}
  DEV_NEXT_PUBLIC_API_BASE_URL    既定値: ${DEFAULT_API_BASE_URL}
  DEV_DOCKER_PLATFORM             既定値: ${DEFAULT_DOCKER_PLATFORM}
`);
    done();
  });
}
