#!/bin/bash
set -e

DOMAIN="mafluencer.ma"
EMAIL="solaymanech@gmail.com"

echo "==> Step 1: Ensure nginx is running with HTTP-only config (already set)"
docker-compose restart nginx

echo "==> Step 2: Obtain SSL certificate via certbot (webroot)"
mkdir -p /var/www/certbot

certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "==> Step 3: Switch nginx to full SSL config"
cp nginx/nginx-ssl.conf nginx/nginx.conf

docker-compose exec nginx nginx -s reload || docker-compose restart nginx

echo "==> Done! SSL certificate obtained. Site is now HTTPS."
