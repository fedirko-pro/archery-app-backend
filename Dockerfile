# =========================
# Базовий образ
# =========================
FROM node:22-alpine AS base

# Встановлення pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# =========================
# Встановлення залежностей
# =========================
FROM base AS deps

# Копіюємо package.json та lockfile
COPY ./src/package.json ./src/pnpm-workspace.yaml ./

# Встановлюємо залежності без frozen-lockfile (щоб уникнути проблем)
RUN pnpm install --no-frozen-lockfile

# =========================
# Збірка проекту
# =========================
FROM base AS build

WORKDIR /app

# Копіюємо node_modules з deps
COPY --from=deps /app/node_modules ./node_modules

# Копіюємо src та інші конфігурації
COPY ./src ./src
COPY ./src/package.json ./package.json
COPY ./src/tsconfig*.json ./
COPY ./src/mikro-orm.config.ts ./

# Збираємо NestJS проект
RUN pnpm run build

# =========================
# Фінальний образ
# =========================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Копіюємо з build тільки те, що потрібно для запуску
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/mikro-orm.config.ts ./
COPY --from=build /app/tsconfig*.json ./

# Створення директорій для uploads та PDF
RUN mkdir -p uploads/images/avatars \
    uploads/images/banners \
    uploads/attachments \
    pdf/rules

EXPOSE 3000

CMD ["node", "dist/main.js"]
