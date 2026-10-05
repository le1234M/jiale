#!/bin/bash
# 自动保活脚本 - 每隔 3 分钟检查服务是否存活，挂了自动重启

WORKSPACE="/workspace/projects"
LOG_FILE="/app/work/logs/bypass//app.log"

while true; do
  if ! curl -s --max-time 5 http://localhost:5000/ > /dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 服务挂了，正在重启..." >> "$LOG_FILE"
    rm -rf "$WORKSPACE/.next/dev/lock" 2>/dev/null
    cd "$WORKSPACE" && PUPPETEER_SKIP_DOWNLOAD=true nohup ./node_modules/.bin/tsx watch src/server.ts >> "$LOG_FILE" 2>&1 &
    sleep 15
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 重启完成" >> "$LOG_FILE"
  fi
  sleep 180  # 3 分钟检查一次
done