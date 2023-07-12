FROM node:lts
WORKDIR /fukusound
RUN npm i -g pnpm
COPY . .
RUN pnpm install
ENV API_URL="http://fukusound-api:3001/"
RUN pnpm packages:build
WORKDIR /fukusound/apps/website
CMD ["pnpm", "run", "start"]
