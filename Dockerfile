# =========================
# БАЗОВИЙ СТЕЙДЖ
# =========================
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# =========================
# ВСТАНОВЛЕННЯ ЗАЛЕЖНОСТЕЙ
# =========================
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# =========================
# ЗБІРКА ПРОЕКТУ
# =========================
FROM base AS build

# Копіюємо node_modules зі стадії deps
COPY --from=deps /app/node_modules ./node_modules

# Копіюємо весь код проекту
COPY . .

# Збираємо проект NestJS
RUN pnpm run build

# Перевірка: чи існує dist/main.js
RUN if [ ! -f dist/main.js ]; then echo "❌ dist/main.js не знайдено!"; exit 1; fi

# =========================
# РАННЕР ДЛЯ ПРОДУКЦІЇ
# =========================
FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy required files
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/mikro-orm.config.ts ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/tsconfig.build.json ./

# Create directories for uploads and PDF
RUN mkdir -p uploads/images/avatars \
    uploads/images/banners \
    uploads/attachments \
    pdf/rules

EXPOSE 3000

CMD ["node", "dist/main.js"]
