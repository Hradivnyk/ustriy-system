#!/bin/bash
# Скрипт для першого отримання SSL-сертифіката від Let's Encrypt.
# Вирішує проблему "курки і яйця": nginx не стартує без сертифіката,
# а certbot не може отримати сертифікат без запущеного nginx.
#
# Використання:
#   DOMAIN=yourdomain.com EMAIL=your@email.com ./scripts/init-letsencrypt.sh

set -e

# ─── Валідація аргументів ────────────────────────────────────────────────────
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Помилка: потрібно вказати DOMAIN та EMAIL"
  echo "Приклад: DOMAIN=yourdomain.com EMAIL=your@email.com ./scripts/init-letsencrypt.sh"
  exit 1
fi

CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

# ─── Крок 1: Замінюємо YOUR_DOMAIN у nginx.conf ─────────────────────────────
echo ">>> Налаштовуємо nginx.conf для домену: $DOMAIN"
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" ./nginx/nginx.conf

# ─── Крок 2: Тимчасовий self-signed сертифікат, щоб nginx зміг стартувати ───
echo ">>> Створюємо тимчасовий сертифікат..."
docker compose run --rm --entrypoint "" certbot sh -c "
  mkdir -p '$CERT_PATH' &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout '$CERT_PATH/privkey.pem' \
    -out    '$CERT_PATH/fullchain.pem' \
    -subj   '/CN=localhost' 2>/dev/null
"

# ─── Крок 3: Запускаємо nginx з тимчасовим сертифікатом ──────────────────────
echo ">>> Запускаємо nginx..."
docker compose up -d nginx
sleep 5

# ─── Крок 4: Вимикаємо автоперезапуск nginx на час отримання сертифіката ────
# Після видалення temp cert Docker міг би перезапустити nginx (без сертифіката
# nginx упаде). Вимикаємо це на час роботи certbot.
NGINX_ID=$(docker compose ps -q nginx)
docker update --restart=no "$NGINX_ID"

# ─── Крок 5: Видаляємо тимчасовий сертифікат ────────────────────────────────
# nginx тримає cert в пам'яті — продовжує слухати порт 80 для ACME-challenge
echo ">>> Видаляємо тимчасовий сертифікат..."
docker compose run --rm --entrypoint "" certbot sh -c "rm -rf '$CERT_PATH'"

# ─── Крок 6: Отримуємо справжній сертифікат від Let's Encrypt ───────────────
echo ">>> Запитуємо сертифікат Let's Encrypt для $DOMAIN..."
docker compose run --rm --entrypoint "" certbot certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# ─── Крок 7: Відновлюємо автоперезапуск і перезавантажуємо nginx ─────────────
docker update --restart=unless-stopped "$NGINX_ID"

echo ">>> Перезавантажуємо nginx..."
docker compose exec nginx nginx -s reload

echo ""
echo "✓ Готово! Сертифікат отримано для $DOMAIN"
echo "  Автооновлення: certbot-контейнер перевіряє оновлення кожні 12 годин"
