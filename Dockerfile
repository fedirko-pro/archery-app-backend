# -----------------------
# Build stage
# -----------------------
FROM node:22-alpine AS build

WORKDIR /app

# Встановлюємо pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Копіюємо залежності
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Копіюємо весь код проекту (TS + конфіги)
COPY . .

# Збираємо TypeScript
RUN pnpm run build

# -----------------------
# Runner stage
# -----------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Копіюємо залежності та весь код з build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/mikro-orm.config.ts ./mikro-orm.config.ts
COPY --from=build /app/.env* ./

# Створюємо потрібні директорії для аплоадів
RUN mkdir -p uploads/images/avatars uploads/images/banners uploads/attachments pdf/rules

# Вказуємо робочий каталог для запуску команд TS
WORKDIR /app

# Команда за замовчуванням
CMD ["node", "dist/src/main.js"]
