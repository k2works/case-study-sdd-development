#!/bin/bash
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.rbenv/shims:$PATH"
eval "$(rbenv init -)"
cd "$(dirname "$0")/../../apps"
bundle exec rails server -p ${PORT:-3000}
