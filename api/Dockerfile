FROM node:22 AS build

WORKDIR /usr/src

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:22-slim

WORKDIR /usr/src

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
