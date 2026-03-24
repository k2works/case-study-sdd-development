#!/bin/bash
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/v24.11.0/bin:$PATH"
cd "$(dirname "$0")/../.."
docker compose -f ops/docker/sonarqube-local/docker-compose.yml up sonarqube
