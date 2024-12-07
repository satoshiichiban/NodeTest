#!/bin/bash

# 実行するフォルダが正しいか確認
CURRENT_DIR=$(pwd)
EXPECTED_DIR="$HOME/Desktop/NodeTest"

if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
  echo "Error: This script must be run inside $EXPECTED_DIR"
  exit 1
fi

# 現在のディレクトリを確認して表示
echo "Saving updates for NodeTest..."

# Git操作をまとめて実行
git add .                           # すべての変更をステージング
git commit -m "${1:-"Update files on $(date '+%Y-%m-%d %H:%M:%S')"}"
git push                            # リモートリポジトリにプッシュ

# 完了メッセージ
echo "All changes have been pushed to GitHub!"

