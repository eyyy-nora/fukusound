FROM node:lts
WORKDIR /fukusound
RUN npm i -g pnpm
COPY . .
RUN pnpm install
RUN pnpm packages:build
WORKDIR /fukusound/apps/service
CMD ["pnpm", "run", "start"]
