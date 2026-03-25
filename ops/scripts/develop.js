'use strict';

import path from 'path';
import { execSync } from 'child_process';
import { cleanDockerEnv, isDockerAvailable, openUrl } from './shared.js';

// ============================================
// 設定
// ============================================

const APPS_DIR = path.resolve('apps');
const POSTGRES_DIR = path.resolve('ops/docker/postgres');
const NIX_RUBY_SHELL = path.resolve('ops/nix/environments/ruby/shell.nix');
const POSTGRES_CONTAINER = 'frere-memoire-postgres';
const RAILS_PORT = 3000;

// ============================================
// ヘルパー関数
// ============================================

/**
 * apps/ ディレクトリでコマンドを実行する
 * Ruby 環境が nix の場合は nix-shell 経由で実行する
 * @param {string} command - 実行するコマンド
 * @param {object} [options] - execSync オプション
 * @param {boolean} [options.raw] - true の場合 rubyCommand ラップをスキップ
 * @returns {string|void}
 */
function execInApps(command, options = {}) {
  const { raw, ...execOptions } = options;
  const defaults = { cwd: APPS_DIR, stdio: 'inherit', env: cleanDockerEnv() };
  const cmd = raw ? command : rubyCommand(command);
  return execSync(cmd, { ...defaults, ...execOptions });
}

/**
 * コマンドが利用可能か確認する
 * @param {string} cmd - 確認するコマンド
 * @returns {boolean}
 */
function isCommandAvailable(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * システム Ruby のバージョンと bundler の有無を確認する
 * @returns {{ version: string, hasBundler: boolean } | null}
 */
function checkSystemRuby() {
  if (!isCommandAvailable('ruby')) return null;
  try {
    const version = execSync('ruby -e "puts RUBY_VERSION"', { stdio: 'pipe' }).toString().trim();
    const hasBundler = isCommandAvailable('bundle');
    return { version, hasBundler };
  } catch {
    return null;
  }
}

/**
 * Ruby 環境の種別を判定する
 * 判定順: rbenv > システム Ruby（バージョン一致＋bundler あり） > nix > システム Ruby（フォールバック）
 * @returns {'rbenv'|'system'|'nix'}
 */
function detectRubyEnv() {
  // 1. rbenv があれば最優先
  if (isCommandAvailable('rbenv')) return 'rbenv';

  // 2. システム Ruby がバージョン一致＋bundler ありなら使う
  const sysRuby = checkSystemRuby();
  if (sysRuby) {
    try {
      const requiredVersion = execSync('cat .ruby-version', { cwd: APPS_DIR, stdio: 'pipe' }).toString().trim();
      if (sysRuby.version === requiredVersion && sysRuby.hasBundler) {
        return 'system';
      }
    } catch {
      // .ruby-version が読めない場合は bundler があればシステム Ruby を使う
      if (sysRuby.hasBundler) return 'system';
    }
  }

  // 3. nix があれば nix（正しいバージョン＋依存を提供）
  if (isCommandAvailable('nix-shell')) return 'nix';

  // 4. システム Ruby がある場合はフォールバック（バージョン不一致でも試行）
  if (sysRuby && sysRuby.hasBundler) return 'system';

  console.error('エラー: 利用可能な Ruby 環境が見つかりません。');
  console.error('  以下のいずれかをインストールしてください:');
  console.error('    - rbenv（推奨）');
  console.error('    - nix');
  process.exit(1);
}

/**
 * Ruby 環境に応じたコマンドラッパーを返す
 * rbenv/システム Ruby があればそのまま実行、なければ nix-shell 経由で実行する
 * nix 環境ではシステム gem との混在を防ぐため GEM_HOME/GEM_PATH をクリアし
 * BUNDLE_PATH でプロジェクトローカルに gem を隔離する
 * @param {string} command - 実行するコマンド
 * @returns {string} ラップされたコマンド
 */
function rubyCommand(command) {
  const env = detectRubyEnv();
  if (env === 'rbenv' || env === 'system') {
    return command;
  }
  // nix: shell.nix の shellHook で GEM_HOME/GEM_PATH をクリア済み
  // BUNDLE_PATH で vendor/bundle に gem を隔離
  const escapedCmd = command.replace(/"/g, '\\"');
  return `nix-shell ${NIX_RUBY_SHELL} --run "export BUNDLE_PATH=vendor/bundle && ${escapedCmd}"`;
}

/**
 * Ruby 環境をセットアップする（rbenv、システム Ruby、または nix）
 */
function setupRubyEnvironment() {
  const env = detectRubyEnv();
  const requiredVersion = execSync('cat .ruby-version', { cwd: APPS_DIR, stdio: 'pipe' }).toString().trim();
  console.log(`  必要な Ruby バージョン: ${requiredVersion}`);

  if (env === 'rbenv') {
    console.log('Ruby 環境: rbenv を使用します');
    try {
      execSync(`rbenv versions --bare | grep -q "^${requiredVersion}$"`, { stdio: 'pipe' });
      console.log(`  Ruby ${requiredVersion} はインストール済みです`);
    } catch {
      console.log(`  Ruby ${requiredVersion} をインストールしています...`);
      execSync(`rbenv install ${requiredVersion}`, { stdio: 'inherit' });
    }
    execSync('rbenv rehash', { stdio: 'inherit' });
  } else if (env === 'system') {
    const sysRuby = checkSystemRuby();
    console.log(`Ruby 環境: システム Ruby を使用します（${sysRuby.version}）`);
    if (sysRuby.version !== requiredVersion) {
      console.warn(`  警告: システム Ruby ${sysRuby.version} と .ruby-version ${requiredVersion} が異なります`);
    }
  } else {
    console.log('Ruby 環境: nix を使用します');
    console.log('  nix-shell で Ruby 環境を確認しています...');
    execSync(`nix-shell ${NIX_RUBY_SHELL} --run "ruby --version"`, { stdio: 'inherit' });
    // nix 環境では vendor/bundle に gem を隔離（システム gem との .so 競合を防止）
    console.log('  gem をプロジェクトローカル（vendor/bundle）にインストールします');
    execSync('bundle config set --local path vendor/bundle', { cwd: APPS_DIR, stdio: 'inherit' });
  }
}

/**
 * PostgreSQL コンテナが起動しているか確認する
 * @returns {boolean}
 */
function isPostgresRunning() {
  try {
    const result = execSync(
      `docker inspect -f '{{.State.Running}}' ${POSTGRES_CONTAINER}`,
      { stdio: 'pipe', env: cleanDockerEnv() }
    ).toString().trim();
    return result === 'true';
  } catch {
    return false;
  }
}

/**
 * PostgreSQL を Docker Compose で起動する
 */
function startPostgres() {
  if (isPostgresRunning()) {
    console.log('PostgreSQL は既に起動しています');
    return;
  }
  console.log('PostgreSQL を起動しています...');
  execSync('docker compose up -d', {
    cwd: POSTGRES_DIR,
    stdio: 'inherit',
    env: cleanDockerEnv(),
  });
  console.log('PostgreSQL が起動しました');
}

/**
 * PostgreSQL を停止する
 */
function stopPostgres() {
  if (!isPostgresRunning()) {
    console.log('PostgreSQL は停止しています');
    return;
  }
  console.log('PostgreSQL を停止しています...');
  execSync('docker compose down', {
    cwd: POSTGRES_DIR,
    stdio: 'inherit',
    env: cleanDockerEnv(),
  });
  console.log('PostgreSQL を停止しました');
}

// ============================================
// Gulp タスク
// ============================================

export default function(gulp) {

  // --- DB タスク ---

  gulp.task('dev:db:start', (done) => {
    if (!isDockerAvailable()) {
      console.error('エラー: Docker が利用できません。Docker を起動してください。');
      process.exit(1);
    }
    startPostgres();
    done();
  });

  gulp.task('dev:db:stop', (done) => {
    stopPostgres();
    done();
  });

  gulp.task('dev:db:setup', gulp.series('dev:db:start', (done) => {
    console.log('データベースをセットアップしています...');
    execInApps('bin/rails db:create db:migrate db:seed');
    console.log('データベースのセットアップが完了しました');
    done();
  }));

  gulp.task('dev:db:migrate', (done) => {
    execInApps('bin/rails db:migrate');
    done();
  });

  gulp.task('dev:db:reset', gulp.series('dev:db:start', (done) => {
    console.log('データベースをリセットしています...');
    execInApps('bin/rails db:reset');
    console.log('データベースのリセットが完了しました');
    done();
  }));

  // --- セットアップタスク ---

  gulp.task('dev:setup', gulp.series((done) => {
    console.log('=== 開発環境セットアップ ===\n');

    // 1. Ruby 環境
    console.log('-- Ruby 環境 --');
    setupRubyEnvironment();

    // 2. Bundle install
    console.log('\n-- 依存パッケージ --');
    execInApps('bundle install');

    done();
  }, 'dev:db:setup', (done) => {
    console.log('\n=== セットアップ完了 ===');
    console.log('  npx gulp dev:server  でサーバーを起動できます');
    done();
  }));

  // --- テストタスク ---

  gulp.task('dev:test', (done) => {
    console.log('テストを実行しています...');
    execInApps('bin/rake spec');
    done();
  });

  gulp.task('dev:lint', (done) => {
    console.log('Lint を実行しています...');
    execInApps('bin/rubocop');
    done();
  });

  gulp.task('dev:security', (done) => {
    console.log('セキュリティスキャンを実行しています...');
    execInApps('bin/brakeman -q');
    done();
  });

  gulp.task('dev:check', gulp.series('dev:test', 'dev:lint', 'dev:security'));

  // --- サーバータスク ---

  gulp.task('dev:server', gulp.series('dev:db:start', (done) => {
    console.log(`Rails サーバーを起動しています（ポート ${RAILS_PORT}）...`);
    execInApps(`bin/rails server -p ${RAILS_PORT}`);
    done();
  }));

  gulp.task('dev:open', (done) => {
    openUrl(`http://localhost:${RAILS_PORT}`);
    done();
  });

  // --- TDD タスク ---

  gulp.task('tdd:backend', (done) => {
    console.log('TDD モード: ファイル変更を監視してテストを自動実行します...');
    try {
      execInApps('bundle exec guard');
    } catch {
      // guard が Ctrl+C で終了した場合
    }
    done();
  });

  // --- ヘルプ ---

  gulp.task('dev:help', (done) => {
    console.log(`
=== アプリケーション開発コマンド ===

  dev:setup               開発環境セットアップ（Ruby + bundle + DB）

  dev:db:start            PostgreSQL を起動
  dev:db:stop             PostgreSQL を停止
  dev:db:setup            DB 作成 + マイグレーション + シード
  dev:db:migrate          マイグレーション実行
  dev:db:reset            DB リセット（drop + create + migrate + seed）

  dev:test                全テスト実行（RSpec）
  dev:lint                RuboCop 実行
  dev:security            Brakeman セキュリティスキャン
  dev:check               テスト + Lint + セキュリティ 一括実行

  dev:server              Rails サーバー起動（DB 自動起動付き）
  dev:open                ブラウザでアプリを開く

  tdd:backend             TDD モード（Guard でファイル監視）

  dev:help                このヘルプを表示
    `);
    done();
  });
}
