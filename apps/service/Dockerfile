FROM node:lts
WORKDIR /service
RUN npm i -g pnpm
COPY . .
RUN pnpm install
RUN pnpm packages:build
WORKDIR /service/apps/service
CMD ["pnpm", "run", "start"]
