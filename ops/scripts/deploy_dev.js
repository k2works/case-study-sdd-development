'use strict';

import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { cleanDockerEnv } from './shared.js';

// ============================================
// 設定
// ============================================

const PREFIX = 'DEV';

/** Heroku アプリ名 */
const appName = () => process.env[`${PREFIX}_HEROKU_APP`] || 'sdd-case-study-take2';

/** webshop ディレクトリ */
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webshopDir = () => path.resolve(scriptDir, '../../apps/webshop');

// ============================================
// ヘルパー関数
// ============================================

/**
 * Heroku CLI コマンドを実行する
 * @param {string} command - 実行するコマンド
 * @param {object} [options] - オプション
 * @param {boolean} [options.ignoreError] - エラーを無視するか
 */
function herokuExec(command, options = {}) {
  const app = appName();
  const cmd = `heroku ${command} -a ${app}`;
  try {
    execSync(cmd, { stdio: 'inherit', env: cleanDockerEnv() });
  } catch (err) {
    if (!options.ignoreError) {
      console.error(`エラー: ${err.message}`);
      process.exit(1);
    }
  }
}

/**
 * Docker イメージをビルドする
 */
function buildImage() {
  const dir = webshopDir();
  console.log('Docker イメージをビルド中...');
  execSync(
    `docker build --provenance=false -t registry.heroku.com/${appName()}/web -f Dockerfile.heroku .`,
    { cwd: dir, stdio: 'inherit', env: cleanDockerEnv() }
  );
  console.log('ビルド完了');
}

/**
 * Docker イメージを Heroku Container Registry にプッシュする
 */
function pushImage() {
  console.log('Container Registry にプッシュ中...');
  execSync(
    `docker push registry.heroku.com/${appName()}/web`,
    { stdio: 'inherit', env: cleanDockerEnv() }
  );
  console.log('プッシュ完了');
}

/**
 * Heroku にリリースする
 */
function releaseImage() {
  console.log('リリース中...');
  herokuExec('container:release web');
  console.log('リリース完了');
}

// ============================================
// Gulp タスク
// ============================================

export default function(gulp) {

  gulp.task('deploy:dev:login', (done) => {
    execSync('heroku container:login', { stdio: 'inherit' });
    done();
  });

  gulp.task('deploy:dev:build', (done) => {
    buildImage();
    done();
  });

  gulp.task('deploy:dev:push', (done) => {
    pushImage();
    done();
  });

  gulp.task('deploy:dev:release', (done) => {
    releaseImage();
    done();
  });

  gulp.task('deploy:dev', gulp.series(
    'deploy:dev:build',
    'deploy:dev:push',
    'deploy:dev:release'
  ));

  gulp.task('deploy:dev:status', (done) => {
    herokuExec('ps');
    done();
  });

  gulp.task('deploy:dev:logs', (done) => {
    herokuExec('logs --tail');
    done();
  });

  gulp.task('deploy:dev:open', (done) => {
    herokuExec('open');
    done();
  });

  gulp.task('deploy:dev:setup', gulp.series(
    'deploy:dev:login',
    'deploy:dev:build',
    'deploy:dev:push',
    'deploy:dev:release',
    'deploy:dev:open'
  ));

  gulp.task('deploy:dev:clean', (done) => {
    const app = appName();
    console.log(`Heroku アプリ ${app} を削除します...`);
    try {
      execSync(`heroku apps:destroy ${app} --confirm ${app}`, { stdio: 'inherit' });
    } catch (err) {
      console.error(`削除に失敗しました: ${err.message}`);
    }
    done();
  });

  gulp.task('deploy:dev:help', (done) => {
    console.log(`
=== 開発環境（Heroku）デプロイコマンド ===

  deploy:dev:login        Heroku Container Registry にログイン
  deploy:dev:build        Docker イメージをローカルビルド
  deploy:dev:push         Container Registry にプッシュ
  deploy:dev:release      Heroku にリリース
  deploy:dev              ビルド → プッシュ → リリースを一括実行
  deploy:dev:status       dyno 状態を確認
  deploy:dev:logs         アプリログを表示（リアルタイム）
  deploy:dev:open         ブラウザでアプリを開く
  deploy:dev:setup        初回セットアップ（ログイン → ビルド → デプロイ → 開く）
  deploy:dev:clean        Heroku アプリを削除
  deploy:dev:help         このヘルプを表示

環境変数（.env）:
  DEV_HEROKU_APP          Heroku アプリ名（デフォルト: sdd-case-study-take2）
    `);
    done();
  });
}
