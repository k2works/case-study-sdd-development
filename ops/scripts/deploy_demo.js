'use strict';

import { execSync } from 'child_process';
import { cleanDockerEnv, isDockerAvailable, openUrl } from './shared.js';

// ============================================
// 設定
// ============================================

const HEROKU_APP = process.env.HEROKU_DEMO_APP || 'case-study-sdd-development';
const HEROKU_URL = process.env.HEROKU_DEMO_URL || 'https://case-study-sdd-development-9ccecd92a04d.herokuapp.com/';
const DOCKERFILE = 'Dockerfile.web';
const LOCAL_IMAGE = 'fleur-memoire-demo';
const LOCAL_PORT = 3000;
const CONTAINER_PORT = 8080;

// ============================================
// ヘルパー関数
// ============================================

/**
 * Docker が利用可能であることを確認し、利用不可なら終了する
 */
function requireDocker() {
  if (!isDockerAvailable()) {
    console.error('エラー: Docker が利用できません。Docker Desktop を起動してください。');
    process.exit(1);
  }
}

/**
 * Heroku CLI コマンドを実行する
 * @param {string} subcommand - heroku サブコマンド
 * @param {object} [options] - オプション
 * @param {boolean} [options.silent] - 出力を抑制するか
 */
function heroku(subcommand, options = {}) {
  const stdio = options.silent ? 'pipe' : 'inherit';
  return execSync(`heroku ${subcommand} -a ${HEROKU_APP}`, {
    stdio,
    env: cleanDockerEnv(),
  });
}

/**
 * ローカル Docker コマンドを実行する
 * @param {string} command - docker コマンド
 */
function docker(command) {
  execSync(`docker ${command}`, {
    stdio: 'inherit',
    env: cleanDockerEnv(),
  });
}

// ============================================
// Gulp タスク
// ============================================

export default function (gulp) {

  // ------------------------------------------
  // ローカルビルド・テスト
  // ------------------------------------------

  gulp.task('demo:build', (done) => {
    requireDocker();
    console.log(`デモイメージをビルドします (${DOCKERFILE})...`);
    docker(`build -f ${DOCKERFILE} -t ${LOCAL_IMAGE} .`);
    console.log('ビルド完了');
    done();
  });

  gulp.task('demo:run', (done) => {
    requireDocker();
    console.log(`デモコンテナをローカルで起動します (localhost:${LOCAL_PORT})...`);
    try {
      docker(`rm -f demo-local 2>/dev/null || true`);
    } catch {
      // コンテナが存在しない場合は無視
    }
    docker(`run --rm -d --name demo-local -p ${LOCAL_PORT}:${CONTAINER_PORT} ${LOCAL_IMAGE}`);
    console.log(`デモが起動しました: http://localhost:${LOCAL_PORT}`);
    done();
  });

  gulp.task('demo:stop', (done) => {
    requireDocker();
    console.log('デモコンテナを停止します...');
    try {
      docker('stop demo-local');
      console.log('停止しました');
    } catch {
      console.log('デモコンテナは起動していません');
    }
    done();
  });

  gulp.task('demo:open:local', (done) => {
    openUrl(`http://localhost:${LOCAL_PORT}`);
    done();
  });

  gulp.task('demo:local', gulp.series('demo:build', 'demo:run'));

  // ------------------------------------------
  // Heroku デプロイ
  // ------------------------------------------

  gulp.task('demo:login', (done) => {
    console.log('Heroku Container Registry にログインします...');
    execSync('heroku container:login', { stdio: 'inherit' });
    done();
  });

  gulp.task('demo:push', (done) => {
    requireDocker();
    console.log(`Heroku にイメージをプッシュします (${HEROKU_APP})...`);
    execSync(`heroku container:push web --recursive -a ${HEROKU_APP}`, {
      stdio: 'inherit',
      env: cleanDockerEnv(),
    });
    console.log('プッシュ完了');
    done();
  });

  gulp.task('demo:release', (done) => {
    console.log(`Heroku にリリースします (${HEROKU_APP})...`);
    heroku('container:release web');
    console.log('リリース完了');
    done();
  });

  gulp.task('demo:deploy', gulp.series('demo:login', 'demo:push', 'demo:release'));

  // ------------------------------------------
  // Heroku 管理
  // ------------------------------------------

  gulp.task('demo:status', (done) => {
    console.log(`=== デモ環境ステータス (${HEROKU_APP}) ===`);
    heroku('ps');
    done();
  });

  gulp.task('demo:logs', (done) => {
    heroku('logs --tail');
    done();
  });

  gulp.task('demo:restart', (done) => {
    console.log('dyno を再起動します（DB リセット）...');
    heroku('restart');
    console.log('再起動しました');
    done();
  });

  gulp.task('demo:open', (done) => {
    openUrl(HEROKU_URL);
    done();
  });

  // ------------------------------------------
  // 初回セットアップ
  // ------------------------------------------

  gulp.task('demo:setup', gulp.series(
    'demo:login',
    'demo:push',
    'demo:release',
  ));

  // ------------------------------------------
  // ヘルプ
  // ------------------------------------------

  gulp.task('demo:help', (done) => {
    console.log(`
=== デモ環境デプロイコマンド ===

  ローカル:
    demo:build            Docker イメージをローカルビルド
    demo:run              ローカルでデモコンテナを起動 (localhost:${LOCAL_PORT})
    demo:stop             ローカルのデモコンテナを停止
    demo:open:local       ローカルデモをブラウザで開く
    demo:local            ビルド＆起動（ローカル一括）

  Heroku デプロイ:
    demo:login            Heroku Container Registry にログイン
    demo:push             イメージをビルド＆プッシュ
    demo:release          Heroku にリリース
    demo:deploy           ログイン→プッシュ→リリース（一括）

  Heroku 管理:
    demo:status           dyno ステータスを確認
    demo:logs             リアルタイムログを表示
    demo:restart          dyno を再起動（DB リセット）
    demo:open             デモサイトをブラウザで開く

  セットアップ:
    demo:setup            初回セットアップ（ログイン→プッシュ→リリース）

  ヘルプ:
    demo:help             このヘルプを表示

  環境変数（.env）:
    HEROKU_DEMO_APP       Heroku アプリ名（デフォルト: ${HEROKU_APP}）
`);
    done();
  });
}
