# =========================
# Базовий образ
FROM node:22-alpine AS base

# Встановлення pnpm через corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# =========================
# Етап залежностей
FROM base AS deps

# Копіюємо тільки package.json, lockfile та workspace
COPY ./src/package*.json ./
COPY ./src/pnpm-workspace.yaml ./

# Встановлюємо залежності
RUN pnpm install --no-frozen-lockfile

# =========================
# Етап збірки
FROM base AS build

WORKDIR /app

# Копіюємо node_modules з deps
COPY --from=deps /app/node_modules ./node_modules

# Копіюємо package.json і lockfile, щоб build скрипти працювали
COPY ./src/package*.json ./
COPY ./src/pnpm-workspace.yaml ./

# Копіюємо весь код
COPY ./src ./

# Збираємо проект NestJS
RUN pnpm run build

# =========================
# Етап запуску
FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

# Копіюємо збірку та залежності
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/mikro-orm.config.ts ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/tsconfig.build.json ./

# Створюємо директорії для uploads та PDF
RUN mkdir -p uploads/images/avatars \
    uploads/images/banners \
    uploads/attachments \
    pdf/rules

EXPOSE 3000

CMD ["node", "dist/main.js"]
