FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

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
