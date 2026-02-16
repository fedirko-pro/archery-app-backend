# =========================
# Базовий образ Node + pnpm
# =========================
FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# =========================
# Встановлення залежностей
# =========================
FROM base AS deps

# Копіюємо package.json та pnpm-workspace.yaml з папки src
COPY ./src/package*.json ./ 
COPY ./src/pnpm-workspace.yaml ./ 

# Встановлення залежностей
RUN pnpm install --no-frozen-lockfile

# =========================
# Збірка проекту
# =========================
FROM base AS build

WORKDIR /app

# Копіюємо залежності з попереднього етапу
COPY --from=deps /app/node_modules ./node_modules

# Копіюємо весь код з src
COPY ./src ./ 

# Збірка NestJS
RUN pnpm run build

# =========================
# Фінальний образ для продакшн
# =========================
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Копіюємо зібраний код та залежності
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/mikro-orm.config.ts ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/tsconfig.build.json ./

# Створення директорій для uploads та PDF
RUN mkdir -p uploads/images/avatars \
    uploads/images/banners \
    uploads/attachments \
    pdf/rules

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
