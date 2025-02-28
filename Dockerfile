# Build Stage
FROM node:22 AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Production Stage
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY package.json package-lock.json ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "dist/main.js"]
