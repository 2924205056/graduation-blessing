#!/usr/bin/env bash
# ============================================================
# 毕业祝福墙 · 一键部署脚本
# 适用：Ubuntu 22.04 / 腾讯云或阿里云轻量应用服务器（香港地域推荐）
#
# 用法（在服务器上以 root 执行）：
#   git clone https://github.com/2924205056/graduation-blessing.git
#   cd graduation-blessing && bash deploy.sh
#
# 部署后访问：
#   首页:        https://你的域名/
#   提交祝福:    https://你的域名/submit
#   大屏幕:      https://你的域名/screen
#   二维码页:    https://你的域名/qr
# ============================================================

set -e

# ---------- 颜色输出 ----------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log(){ echo -e "${GREEN}[deploy]${NC} $1"; }
warn(){ echo -e "${YELLOW}[warn]${NC} $1"; }
err(){ echo -e "${RED}[error]${NC} $1"; }

# ---------- 检查 root ----------
if [ "$(id -u)" -ne 0 ]; then
  err "请使用 root 或 sudo 执行本脚本"; exit 1
fi

# ---------- 系统基础 ----------
log "更新系统包索引..."
apt-get update -y > /dev/null
apt-get install -y curl gnupg2 ca-certificates lsb-release ubuntu-keyring ufw > /dev/null

# ---------- Node.js 20 ----------
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 20 ]; then
  log "安装 Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -y nodejs > /dev/null
fi
log "Node: $(node -v) · npm: $(npm -v)"

# ---------- pm2 ----------
if ! command -v pm2 >/dev/null 2>&1; then
  log "安装 pm2..."
  npm install -g pm2 > /dev/null
fi

# ---------- nginx ----------
if ! command -v nginx >/dev/null 2>&1; then
  log "安装 nginx..."
  apt-get install -y nginx > /dev/null
fi
systemctl enable nginx > /dev/null 2>&1 || true
systemctl start nginx > /dev/null 2>&1 || true

# ---------- 防火墙 ----------
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp > /dev/null
  ufw allow 80/tcp > /dev/null
  ufw allow 443/tcp > /dev/null
  # 非交互模式下不去 enable，由用户自行决定
  warn "如需开启防火墙，请手动执行: ufw enable"
fi

# ---------- 代码目录 ----------
APP_DIR="/opt/graduation-blessing"

if [ -d "$APP_DIR/.git" ]; then
  log "已有代码，执行 git pull..."
  cd "$APP_DIR"
  git fetch --depth=1 origin main
  git reset --hard origin/main
else
  log "克隆代码到 $APP_DIR ..."
  # 支持两种情况：脚本已经在项目里，或者从外网拉
  if [ -f "$(pwd)/package.json" ] && grep -q '"next"' "$(pwd)/package.json"; then
    mkdir -p "$(dirname $APP_DIR)"
    cp -r "$(pwd)" "$APP_DIR"
  else
    # 让用户指定仓库地址
    read -rp "请输入 Git 仓库地址（例如 https://github.com/2924205056/graduation-blessing.git）: " REPO_URL
    if [ -z "$REPO_URL" ]; then err "仓库地址不能为空"; exit 1; fi
    mkdir -p "$(dirname $APP_DIR)"
    git clone --depth=1 "$REPO_URL" "$APP_DIR"
  fi
fi

cd "$APP_DIR"

# ---------- Firebase 环境变量 ----------
if [ ! -f ".env.local" ]; then
  warn "未检测到 .env.local 文件，Firebase 配置为空将导致应用无法正常运行！"
  echo
  echo "  请在 Firebase Console (https://console.firebase.google.com) 获取以下配置："
  echo "  - 项目设置 → 常规 → 你的应用 → Firebase SDK snippet → 配置"
  echo
  read -rp "是否现在输入 Firebase 配置？(y/n): " FB_CHOICE
  if [ "$FB_CHOICE" = "y" ] || [ "$FB_CHOICE" = "Y" ]; then
    read -rp "NEXT_PUBLIC_FIREBASE_API_KEY: " FB_API_KEY
    read -rp "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: " FB_AUTH_DOMAIN
    read -rp "NEXT_PUBLIC_FIREBASE_PROJECT_ID: " FB_PROJECT_ID
    read -rp "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: " FB_STORAGE_BUCKET
    read -rp "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: " FB_MSG_SENDER_ID
    read -rp "NEXT_PUBLIC_FIREBASE_APP_ID: " FB_APP_ID
    read -rp "NEXT_PUBLIC_FIREBASE_DATABASE_URL: " FB_DATABASE_URL

    cat > .env.local <<ENVEOF
NEXT_PUBLIC_FIREBASE_API_KEY=${FB_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FB_AUTH_DOMAIN}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FB_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${FB_STORAGE_BUCKET}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${FB_MSG_SENDER_ID}
NEXT_PUBLIC_FIREBASE_APP_ID=${FB_APP_ID}
NEXT_PUBLIC_FIREBASE_DATABASE_URL=${FB_DATABASE_URL}
ENVEOF
    log ".env.local 已创建"
  else
    warn "跳过 Firebase 配置。你可以稍后手动创建 .env.local 文件再重新构建。"
  fi
else
  log "检测到 .env.local，跳过 Firebase 配置"
fi

log "安装依赖..."
# 需要完整依赖（含 devDependencies）才能执行 next build
if [ -f "package-lock.json" ]; then
  npm ci || npm install
else
  npm install
fi

log "构建生产包..."
# 服务器部署使用标准 next build（非 Cloudflare）
npx next build

# ---------- 启动应用 ----------
log "用 pm2 启动应用..."
pm2 delete graduation-blessing > /dev/null 2>&1 || true
# 优先使用 ecosystem.config.js
if [ -f "ecosystem.config.js" ]; then
  pm2 start ecosystem.config.js
else
  pm2 start "npm start" --name graduation-blessing -- -- -p 3000
fi
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# ---------- nginx 反代 ----------
read -rp "请输入绑定的域名（例如 yangbaibai.asia，多个用空格分隔）: " DOMAIN_INPUT
if [ -z "$DOMAIN_INPUT" ]; then
  warn "未输入域名，跳过 nginx 配置。你自己访问 http://服务器IP:3000 即可。"
else
  log "配置 nginx 反代..."
  DOMAINS=($DOMAIN_INPUT)
  SERVER_NAMES=$(IFS=' '; echo "${DOMAINS[*]}")

  cat > /etc/nginx/sites-available/graduation-blessing <<EOF
server {
    listen 80;
    server_name ${SERVER_NAMES};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;

        # 静态资源缓存
        location ~* \\.(?:js|css|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico)$ {
            proxy_pass http://127.0.0.1:3000;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

  ln -sf /etc/nginx/sites-available/graduation-blessing /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  log "nginx 配置完成"

  # ---------- HTTPS (Let's Encrypt) ----------
  log "为域名申请 HTTPS 证书..."
  if ! command -v certbot >/dev/null 2>&1; then
    apt-get install -y certbot python3-certbot-nginx > /dev/null
  fi

  # 为每个域名拼接参数
  DOMAIN_ARGS=""
  for d in "${DOMAINS[@]}"; do
    DOMAIN_ARGS="$DOMAIN_ARGS -d $d"
  done

  certbot --nginx --non-interactive --agree-tos \
    --email admin@"${DOMAINS[0]}" \
    --redirect \
    $DOMAIN_ARGS || warn "证书申请失败，请检查 DNS 解析是否已指向本服务器"
fi

# ---------- 完成 ----------
echo
log "=============================================="
log "部署完成！"
log "=============================================="
log "访问地址（请确保 DNS 解析已设置 A 记录到本服务器 IP）:"
if [ -n "$DOMAIN_INPUT" ]; then
  for d in ${DOMAIN_INPUT}; do
    log "  https://$d/"
    log "  https://$d/submit"
    log "  https://$d/screen"
    log "  https://$d/qr"
  done
else
  echo "本地测试:"
  echo "  http://$(hostname -I | awk '{print $1}'):3000"
fi
log
log "常用命令:"
log "  pm2 status                  查看进程状态"
log "  pm2 logs graduation-blessing -n 100 --lines 100  查看日志"
log "  pm2 restart graduation-blessing  重启应用"
log "  cd $APP_DIR && git pull && npx next build && pm2 restart graduation-blessing   更新部署"
log "=============================================="
