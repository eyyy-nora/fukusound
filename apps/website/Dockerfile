FROM node:lts
WORKDIR /website
RUN npm i -g pnpm
COPY . .
RUN pnpm install
RUN pnpm packages:build
WORKDIR /website/apps/website
CMD ["pnpm", "run", "start"]
