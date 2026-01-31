# Deployment Guide - VPS Ubuntu з Docker

Цей гайд описує деплой архері застосунку (бекенд + фронтенд) на VPS сервер з Ubuntu.

## Структура на сервері

```
/srv/
├── archery-api/
│   ├── docker-compose.yml    # Копія з deploy/docker-compose.api.yml
│   ├── .env                  # Змінні оточення
│   ├── uploads/              # Завантажені файли (images, attachments)
│   ├── pdf/                  # PDF файли (правила)
│   │   └── rules/
│   └── src/                  # Git репозиторій (archery-app-backend)
│
└── archery-front/
    ├── docker-compose.yml    # Копія з deploy/docker-compose.front.yml
    ├── .env                  # Змінні оточення для build
    └── src/                  # Git репозиторій (app-archery)
```

---

## Передумови

- VPS з Ubuntu 22.04+
- Docker та Docker Compose встановлені
- SSH доступ
- Домен налаштований (опціонально для HTTPS)

### Встановлення Docker (якщо ще не встановлено)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## 1. Підготовка Backend (API)

### 1.1. Створення директорій

```bash
sudo mkdir -p /srv/archery-api/{uploads/images/avatars,uploads/images/banners,uploads/attachments,pdf/rules}
sudo chown -R $USER:$USER /srv/archery-api
```

### 1.2. Клонування репозиторію

```bash
cd /srv/archery-api
git clone https://github.com/YOUR_ORG/archery-app-backend.git src
```

### 1.3. Налаштування docker-compose.yml

```bash
cp src/deploy/docker-compose.api.yml docker-compose.yml
```

### 1.4. Створення .env файлу

```bash
cp src/.env.example src/.env
nano src/.env
```

**Важливі змінні для продакшену:**

```env
# Database
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=archery_user
DATABASE_PASSWORD=STRONG_RANDOM_PASSWORD_HERE
DATABASE_NAME=archery_db

# JWT
JWT_SECRET=VERY_LONG_RANDOM_STRING_HERE

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/auth/google/callback

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Server
PORT=3000
NODE_ENV=production
```

### 1.5. Копіювання PDF файлів (правил)

```bash
cp -r src/pdf/rules/*.pdf pdf/rules/
```

### 1.6. Запуск бекенду

```bash
cd /srv/archery-api
docker compose up -d --build

# Перевірка логів
docker compose logs -f api

# Застосування міграцій
docker compose exec api sh -c "node node_modules/.bin/mikro-orm migration:up"

# Запуск сідерів (тільки для першого деплою!)
docker compose exec api sh -c "node node_modules/.bin/mikro-orm seeder:run"
```

---

## 2. Підготовка Frontend

### 2.1. Створення директорій

```bash
sudo mkdir -p /srv/archery-front
sudo chown -R $USER:$USER /srv/archery-front
```

### 2.2. Клонування репозиторію

```bash
cd /srv/archery-front
git clone https://github.com/YOUR_ORG/app-archery.git src
```

### 2.3. Налаштування docker-compose.yml

```bash
cp src/deploy/docker-compose.front.yml docker-compose.yml
```

### 2.4. Створення .env файлу

```bash
cat > .env << EOF
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_AUTH_URL=https://api.yourdomain.com/auth/google
EOF
```

### 2.5. Запуск фронтенду

```bash
cd /srv/archery-front
docker compose up -d --build

# Перевірка логів
docker compose logs -f frontend
```

---

## 3. Налаштування Nginx Reverse Proxy

### 3.1. Встановлення Nginx

```bash
sudo apt install nginx -y
```

### 3.2. Конфігурація для API (api.yourdomain.com)

```bash
sudo nano /etc/nginx/sites-available/archery-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.3. Конфігурація для Frontend (yourdomain.com)

```bash
sudo nano /etc/nginx/sites-available/archery-front
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.4. Активація конфігурацій

```bash
sudo ln -s /etc/nginx/sites-available/archery-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/archery-front /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Налаштування HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Certbot автоматично налаштує HTTPS та оновлення сертифікатів.

---

## 5. Оновлення додатку

### Backend

```bash
cd /srv/archery-api/src
git pull origin main
cd ..
docker compose up -d --build

# Застосування нових міграцій (якщо є)
docker compose exec api sh -c "node node_modules/.bin/mikro-orm migration:up"
```

### Frontend

```bash
cd /srv/archery-front/src
git pull origin main
cd ..
docker compose up -d --build
```

---

## 6. Корисні команди

### Перегляд логів

```bash
# API логи
docker compose -f /srv/archery-api/docker-compose.yml logs -f api

# Frontend логи
docker compose -f /srv/archery-front/docker-compose.yml logs -f frontend

# Database логи
docker compose -f /srv/archery-api/docker-compose.yml logs -f db
```

### Перезапуск сервісів

```bash
# API
docker compose -f /srv/archery-api/docker-compose.yml restart api

# Frontend
docker compose -f /srv/archery-front/docker-compose.yml restart frontend
```

### Backup бази даних

```bash
cd /srv/archery-api
docker compose exec db pg_dump -U archery_user archery_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore бази даних

```bash
cd /srv/archery-api
docker compose exec -T db psql -U archery_user archery_db < backup.sql
```

### Очищення Docker

```bash
# Видалення невикористаних образів
docker image prune -a

# Видалення всього невикористаного
docker system prune -a
```

---

## 7. Troubleshooting

### API не запускається

```bash
# Перевірка логів
docker compose -f /srv/archery-api/docker-compose.yml logs api

# Перевірка змінних оточення
docker compose -f /srv/archery-api/docker-compose.yml exec api env

# Перевірка підключення до БД
docker compose -f /srv/archery-api/docker-compose.yml exec api sh -c "nc -zv db 5432"
```

### Проблеми з міграціями

```bash
# Перевірка статусу міграцій
docker compose exec api sh -c "node node_modules/.bin/mikro-orm migration:list"

# Відкат останньої міграції
docker compose exec api sh -c "node node_modules/.bin/mikro-orm migration:down"
```

### Проблеми з правами на uploads

```bash
sudo chown -R 1000:1000 /srv/archery-api/uploads
sudo chmod -R 755 /srv/archery-api/uploads
```

---

## 8. Безпека

1. **Firewall (ufw)**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **Fail2ban**
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

3. **Регулярні оновлення**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

---

## Тестові облікові дані (після сідінгу)

- **Admin**: `admin@archery.com` / `admin123`
- **Users**: `user1@archery.com` - `user90@archery.com` / `user123`

⚠️ **Змініть паролі перед продакшеном!**
