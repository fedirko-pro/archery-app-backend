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

# Копіюємо весь код
COPY . .

# Збираємо TypeScript
RUN pnpm run build

# -----------------------
# Runner stage
# -----------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Копіюємо залежності і збірку
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/src ./dist
COPY --from=build /app/package.json ./package.json

# Створюємо потрібні директорії для аплоадів
RUN mkdir -p uploads/images/avatars uploads/images/banners uploads/attachments pdf/rules

# Запуск
CMD ["node", "dist/main.js"]
