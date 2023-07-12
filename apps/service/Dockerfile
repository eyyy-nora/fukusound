FROM node:lts
WORKDIR /fukusound
RUN npm i -g pnpm
COPY . .
RUN pnpm install
RUN pnpm packages:build
WORKDIR /fukusound/apps/service
RUN apt-get update -qq && \
    apt-get install ffmpeg -y && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp
CMD ["pnpm", "run", "start"]
