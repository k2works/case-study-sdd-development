'use strict';

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * DOCKER_HOST を除外した環境変数を返す
 * Docker Desktop 使用時に DOCKER_HOST が設定されていると接続エラーが発生するため除外する
 * @returns {Object} DOCKER_HOST を除外した環境変数
 */
export function cleanDockerEnv() {
  const env = { ...process.env };
  delete env.DOCKER_HOST;
  return env;
}

/**
 * Docker デーモンが利用可能か確認する
 * @returns {boolean} Docker が利用可能なら true
 */
export function isDockerAvailable() {
  try {
    execSync('docker info', { stdio: 'ignore', env: cleanDockerEnv() });
    return true;
  } catch {
    return false;
  }
}

/**
 * Java が利用可能かつプロジェクト要件（JDK 21）と互換性があるか確認する
 * @returns {boolean} 互換性のある Java が利用可能なら true
 */
export function isJavaAvailable() {
  try {
    const version = execSync('java -version 2>&1', { encoding: 'utf-8' });
    const match = version.match(/version "(\d+)/);
    if (match) {
      const major = parseInt(match[1], 10);
      // Gradle 8.12 supports up to Java 23; project requires JDK 21
      if (major > 23) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Nix の実行パスを探索する
 * @returns {string|null} Nix の実行パス、見つからなければ null
 */
function findNix() {
  const candidates = [
    `${process.env.HOME}/.nix-profile/bin/nix`,
    '/nix/var/nix/profiles/default/bin/nix',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  try {
    return execSync('which nix', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/**
 * Java が必要なコマンドをラップする
 * Java が利用可能ならそのまま返し、不可なら nix develop でラップする
 * @param {string} command - 実行コマンド
 * @returns {string} ラップ済みコマンド
 */
export function wrapWithJava(command) {
  if (isJavaAvailable()) {
    return command;
  }
  const nix = findNix();
  if (!nix) {
    console.warn('Warning: Java is not available and Nix is not found.');
    console.warn('Please install Java or ensure Nix is on the PATH.');
    return command;
  }
  const flakeDir = path.resolve(new URL('.', import.meta.url).pathname, '../..');
  const escaped = command.replace(/'/g, "'\\''");
  return `${nix} develop ${flakeDir}#webshop --command bash -c '${escaped}'`;
}

/**
 * URL をデフォルトブラウザで開く（クロスプラットフォーム対応）
 * @param {string} url - 開く URL
 */
export function openUrl(url) {
  const platform = process.platform;
  const cmd =
    platform === 'win32' ? `start "" "${url}"` :
    platform === 'darwin' ? `open "${url}"` :
    `xdg-open "${url}"`;
  execSync(cmd, { stdio: 'ignore' });
}
