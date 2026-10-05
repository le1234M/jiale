#!/bin/bash
set -Eeuo pipefail


PORT=5000
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-${PORT}}"


cd "${COZE_WORKSPACE_PATH}"

# Fix missing node_modules/.bin symlinks after partial cleanup
if [ ! -x node_modules/.bin/tsx ]; then
  mkdir -p node_modules/.bin
  for pkg in tsx eslint next; do
    dir=$(find node_modules/.pnpm -maxdepth 1 -type d -name "${pkg}@*" 2>/dev/null | head -1)
    if [ -n "$dir" ] && [ -f "$dir/node_modules/$pkg/package.json" ]; then
      bin_path=$(node -e "const p=require('$dir/node_modules/$pkg/package.json');console.log(p.bin?.$pkg||p.bin||'')")
      if [ -n "$bin_path" ]; then
        ln -sf "../$dir/node_modules/$pkg/$bin_path" "node_modules/.bin/$pkg"
      fi
    fi
  done
  chmod +x node_modules/.bin/* 2>/dev/null || true
fi

kill_port_if_listening() {
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
      echo "Port ${DEPLOY_RUN_PORT} is free."
      return
    fi
    echo "Port ${DEPLOY_RUN_PORT} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {}
    sleep 1
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
      echo "Warning: port ${DEPLOY_RUN_PORT} still busy after SIGKILL, PIDs: ${pids}"
    else
      echo "Port ${DEPLOY_RUN_PORT} cleared."
    fi
}

echo "Clearing port ${DEPLOY_RUN_PORT} before start."
kill_port_if_listening
echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for dev..."

PORT=${DEPLOY_RUN_PORT} pnpm tsx watch src/server.ts
