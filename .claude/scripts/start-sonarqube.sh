#!/bin/bash
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/v24.11.0/bin:$PATH"
cd "$(dirname "$0")/../.."

# SonarQube が既に起動中ならログをフォロー、未起動なら起動
if docker ps --filter "name=sonarqube" --format "{{.Names}}" | grep -q sonarqube; then
  echo "SonarQube is already running on port 9000"
  docker compose -f ops/docker/sonarqube-local/docker-compose.yml logs -f sonarqube
else
  docker compose -f ops/docker/sonarqube-local/docker-compose.yml up sonarqube
fi
