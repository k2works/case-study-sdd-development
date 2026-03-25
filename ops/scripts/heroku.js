'use strict';

import path from 'path';
import { execSync } from 'child_process';
import { cleanDockerEnv, isDockerAvailable } from './shared.js';

// ============================================
// 設定
// ============================================

const APPS_DIR = path.resolve('apps');
const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME || '';
const DOCKERFILE = 'Dockerfile.demo';

// ============================================
// ヘルパー関数
// ============================================

/**
 * Heroku CLI がインストールされているか確認する
 * @returns {boolean}
 */
function isHerokuAvailable() {
  try {
    execSync('heroku --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Heroku アプリ名を取得する（環境変数または引数）
 * @returns {string}
 */
function getAppName() {
  if (HEROKU_APP_NAME) return HEROKU_APP_NAME;
  try {
    return execSync('heroku apps:info --json', { cwd: APPS_DIR, stdio: 'pipe' })
      .toString().trim();
  } catch {
    return '';
  }
}

/**
 * Heroku CLI コマンドを実行する
 * @param {string} command
 * @param {object} [options]
 */
function execHeroku(command, options = {}) {
  const defaults = { cwd: APPS_DIR, stdio: 'inherit', env: cleanDockerEnv() };
  const appFlag = HEROKU_APP_NAME ? ` -a ${HEROKU_APP_NAME}` : '';
  return execSync(`${command}${appFlag}`, { ...defaults, ...options });
}

// ============================================
// Gulp タスク
// ============================================

export default function(gulp) {

  // --- Heroku セットアップ ---

  gulp.task('heroku:login', (done) => {
    console.log('Heroku にログインしています...');
    execSync('heroku login', { stdio: 'inherit' });
    console.log('Heroku Container Registry にログインしています...');
    execSync('heroku container:login', { stdio: 'inherit' });
    done();
  });

  gulp.task('heroku:create', (done) => {
    if (!HEROKU_APP_NAME) {
      console.error('エラー: HEROKU_APP_NAME 環境変数を設定してください');
      console.error('  export HEROKU_APP_NAME=your-app-name');
      console.error('  または .env ファイルに追記してください');
      process.exit(1);
    }
    console.log(`Heroku アプリ ${HEROKU_APP_NAME} を作成しています...`);
    try {
      execSync(`heroku create ${HEROKU_APP_NAME} --stack container`, { cwd: APPS_DIR, stdio: 'inherit' });
    } catch {
      console.log('  アプリが既に存在するか、作成に失敗しました');
    }
    done();
  });

  gulp.task('heroku:config', (done) => {
    console.log('Heroku 環境変数を設定しています...');
    execHeroku('heroku config:set RAILS_ENV=production DATABASE_ADAPTER=sqlite3 RAILS_LOG_LEVEL=info LANG=ja_JP.UTF-8 RAILS_SERVE_STATIC_FILES=true');
    done();
  });

  gulp.task('heroku:setup', gulp.series('heroku:login', 'heroku:create', 'heroku:config', (done) => {
    console.log('\n=== Heroku セットアップ完了 ===');
    console.log('  npx gulp heroku:deploy  でデプロイできます');
    done();
  }));

  // --- ビルド・デプロイ ---

  gulp.task('heroku:build', (done) => {
    if (!isDockerAvailable()) {
      console.error('エラー: Docker が利用できません。Docker を起動してください。');
      process.exit(1);
    }
    console.log('デモ用 Docker イメージをビルドしています...');
    execSync(
      `docker build --platform linux/amd64 --provenance=false -f ${DOCKERFILE} -t frere-memoire-demo .`,
      { cwd: APPS_DIR, stdio: 'inherit', env: cleanDockerEnv() }
    );
    console.log('ビルド完了');
    done();
  });

  gulp.task('heroku:push', (done) => {
    if (!HEROKU_APP_NAME) {
      console.error('エラー: HEROKU_APP_NAME 環境変数を設定してください');
      process.exit(1);
    }
    console.log('Heroku Container Registry にプッシュしています...');
    const registryImage = `registry.heroku.com/${HEROKU_APP_NAME}/web`;
    execSync(
      `docker build --platform linux/amd64 --provenance=false -f ${DOCKERFILE} -t ${registryImage} .`,
      { cwd: APPS_DIR, stdio: 'inherit', env: cleanDockerEnv() }
    );
    execSync(`docker push ${registryImage}`, {
      cwd: APPS_DIR,
      stdio: 'inherit',
      env: cleanDockerEnv(),
    });
    console.log('プッシュ完了');
    done();
  });

  gulp.task('heroku:release', (done) => {
    if (!HEROKU_APP_NAME) {
      console.error('エラー: HEROKU_APP_NAME 環境変数を設定してください');
      process.exit(1);
    }
    console.log('Heroku にリリースしています...');
    execSync(`heroku container:release web -a ${HEROKU_APP_NAME}`, {
      cwd: APPS_DIR,
      stdio: 'inherit',
    });
    console.log('リリース完了');
    done();
  });

  gulp.task('heroku:deploy', gulp.series('heroku:push', 'heroku:release', (done) => {
    console.log('\n=== デプロイ完了 ===');
    if (HEROKU_APP_NAME) {
      console.log(`  https://${HEROKU_APP_NAME}.herokuapp.com`);
    }
    done();
  }));

  // --- 管理 ---

  gulp.task('heroku:logs', (done) => {
    execHeroku('heroku logs --tail');
    done();
  });

  gulp.task('heroku:status', (done) => {
    execHeroku('heroku ps');
    done();
  });

  gulp.task('heroku:open', (done) => {
    execHeroku('heroku open');
    done();
  });

  gulp.task('heroku:run', (done) => {
    execHeroku('heroku run bash');
    done();
  });

  gulp.task('heroku:db:migrate', (done) => {
    execHeroku('heroku run rails db:migrate');
    done();
  });

  gulp.task('heroku:db:seed', (done) => {
    execHeroku('heroku run rails db:seed');
    done();
  });

  gulp.task('heroku:restart', (done) => {
    execHeroku('heroku restart');
    done();
  });

  gulp.task('heroku:destroy', (done) => {
    if (!HEROKU_APP_NAME) {
      console.error('エラー: HEROKU_APP_NAME 環境変数を設定してください');
      process.exit(1);
    }
    console.log(`警告: ${HEROKU_APP_NAME} を削除します`);
    execSync(`heroku apps:destroy ${HEROKU_APP_NAME} --confirm ${HEROKU_APP_NAME}`, {
      stdio: 'inherit',
    });
    done();
  });

  // --- ヘルプ ---

  gulp.task('heroku:help', (done) => {
    console.log(`
=== Heroku デプロイコマンド（デモ用・SQLite） ===

  セットアップ:
    heroku:login             Heroku & Container Registry ログイン
    heroku:create            Heroku アプリ作成（HEROKU_APP_NAME 必須）
    heroku:config            環境変数を設定
    heroku:setup             上記を一括実行

  ビルド・デプロイ:
    heroku:build             ローカルで Docker イメージビルド
    heroku:push              Container Registry にプッシュ
    heroku:release           リリース（デプロイ）
    heroku:deploy            プッシュ + リリースを一括実行

  管理:
    heroku:logs              ログをリアルタイム表示
    heroku:status            dyno の状態確認
    heroku:open              ブラウザでアプリを開く
    heroku:run               Heroku 上で bash を起動
    heroku:restart           dyno を再起動
    heroku:db:migrate        マイグレーション実行
    heroku:db:seed           シードデータ投入
    heroku:destroy           アプリを削除

  環境変数:
    HEROKU_APP_NAME          Heroku アプリ名（.env に設定推奨）

  heroku:help               このヘルプを表示
    `);
    done();
  });
}
