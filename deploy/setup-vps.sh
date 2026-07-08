#!/usr/bin/env bash
set -euo pipefail

# Run on a fresh Ubuntu 22.04/24.04 VPS (REG.RU / REG.CLOUD)
# Usage: sudo bash setup-vps.sh

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

npm install -g pm2

mkdir -p /var/www/proto
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" /var/www/proto

echo "Done. Next steps:"
echo "1. Upload/clone project to /var/www/proto"
echo "2. Create /var/www/proto/.env.local with Supabase keys"
echo "3. cd /var/www/proto && npm install && npm run build"
echo "4. pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup"
echo "5. Copy deploy/nginx.proto.conf.example to /etc/nginx/sites-available/proto"
echo "6. certbot --nginx -d your-domain.ru"
