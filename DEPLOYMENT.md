# Deployment Guide - VPS Ubuntu with Docker & Traefik

This guide describes the deployment of the Archery application (Backend + Frontend) using **Traefik** as a Reverse Proxy with automatic SSL (Let's Encrypt).

---

## 1. Global Infrastructure (Traefik)

Instead of manual Nginx configs, we use Traefik. It communicates with Docker to route traffic based on labels.

### 1.1. Create Shared Network

```bash
docker network create traefik-public
```

### 1.2. Traefik Configuration (/srv/proxy/docker-compose.yml)

Note: Ensure `DOCKER_API_VERSION` matches your host's Docker engine (standard is 1.44).

```yaml
version: "3.9"

services:
  traefik:
    image: traefik:v3
    container_name: traefik
    restart: unless-stopped
    environment:
      - DOCKER_API_VERSION=1.44
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.httpchallenge=true"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.le.acme.email=your-email@gmail.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - traefik-public

networks:
  traefik-public:
    external: true
```

---

## 2. Backend (API) Setup

### 2.1. Crucial Code Adjustment

Ensure `src/main.ts` listens on `0.0.0.0` to accept traffic from the Traefik proxy:

```typescript
// Inside bootstrap() function
await app.listen(3000, '0.0.0.0');
```

### 2.2. Backend Configuration (/srv/archery/archery-api/docker-compose.yml)

```yaml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    container_name: archery_db
    restart: always
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER} -d ${DATABASE_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - default

  api:
    build:
      context: ./src
      dockerfile: ../Dockerfile
    container_name: archery_api
    restart: always
    depends_on:
      db:
        condition: service_healthy
    env_file: .env
    networks:
      - default
      - traefik-public
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-public"
      - "traefik.http.routers.archery-api.rule=Host(`api-archery.fedirko.pro`)"
      - "traefik.http.routers.archery-api.entrypoints=websecure"
      - "traefik.http.routers.archery-api.tls.certresolver=le"
      - "traefik.http.services.archery-api.loadbalancer.server.port=3000"
    command: >
      sh -c "pnpm mikro-orm migration:up && pnpm mikro-orm seeder:run && node dist/src/main"

networks:
  default:
  traefik-public:
    external: true
```

---

## 3. Frontend Setup

### 3.1. Dockerfile Healthcheck Fix

In `src/Dockerfile`, ensure the healthcheck doesn't fail due to missing wget or curl:

```dockerfile
# Use netcat (nc) to verify port 80 is open
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD nc -z localhost 80 || exit 1
```

### 3.2. Frontend Configuration (/srv/archery/archery-front/docker-compose.yml)

```yaml
version: "3.9"

services:
  frontend:
    build:
      context: ./src
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: ${VITE_API_BASE_URL}
        VITE_GOOGLE_AUTH_URL: ${VITE_GOOGLE_AUTH_URL}
    container_name: archery_frontend
    restart: unless-stopped
    networks:
      - default
      - traefik-public
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-public"
      - "traefik.http.routers.archery-front.rule=Host(`archery.fedirko.pro`)"
      - "traefik.http.routers.archery-front.entrypoints=websecure"
      - "traefik.http.routers.archery-front.tls.certresolver=le"
      - "traefik.http.services.archery-front.loadbalancer.server.port=80"

networks:
  default:
  traefik-public:
    external: true
```

---

## 4. Maintenance & Updates

### Update Backend (Code + Migrations)

```bash
cd /srv/archery/archery-api
git pull
docker compose up -d --build
```

Migrations and Seeders will run automatically during the container startup.

### Update Frontend

```bash
cd /srv/archery/archery-front
git pull
docker compose up -d --build --force-recreate
```

Note: `--build` is required to bake new `.env` values into the static production files.

---

## 5. Troubleshooting & Tips

### Check Container Health

If you see a 404 Bad Gateway, it means Traefik is running but cannot "see" your app. Traefik ignores containers that are in the unhealthy state.

```bash
docker ps  # Check if status is "Up (healthy)" or "Up (unhealthy)"
```

### Viewing Logs

```bash
docker logs -f archery_api         # Backend/DB Migration logs
docker logs -f archery_frontend    # Nginx/Frontend logs
docker logs -f traefik             # SSL and Routing logs
```

### Clean Up Old Images

To save disk space from multiple builds:

```bash
docker image prune -f
```

### Seeded Test Credentials (after seeding)

- **Admin:** admin@archery.com / admin123
- **Standard Users:** user1@archery.com to user90@archery.com / user123
