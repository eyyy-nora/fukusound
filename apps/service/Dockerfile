FROM node:lts
WORKDIR /service
RUN npm i -g pnpm
COPY . .
RUN pnpm install
RUN pnpm packages:build
CD apps/service
CMD ["pnpm", "run", "start"]
