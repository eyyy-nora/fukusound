import { Sound, SoundType, User } from "@fukumong/database";
import {
  Body,
  createRequestInjector,
  Delete,
  Get,
  intParser,
  Param,
  Post,
  Query,
  Req,
  Service,
  Session,
} from "@propero/easy-api";
import fileUpload from "express-fileupload";
import FFmpeg from "fluent-ffmpeg";
import { PassThrough, Readable, type Stream } from "node:stream";
import { Mount } from "src/mount";
import { bufferToStream, streamToBuffer } from "src/util/buffer-stream";
import { ILike, In } from "typeorm";
import ytdl from "ytdl-core";
import ytdlp from "yt-dlp-wrap";
import fs from "node:fs/promises";

const File = (name: string) =>
  createRequestInjector(() => req => (req as any).files?.[name]);

@Mount("/sounds")
@Service()
export class SoundController {
  @Get("/")
  public async list(
    @Session("user") user: User,
    @Query("search") search?: string,
    @Query("tags", tagParser()) tags?: string[],
    @Query("page", intParser()) page: number = 0,
    @Query("pageSize", intParser()) pageSize: number = 36,
    @Query("type") type: SoundType = SoundType.Music,
    @Query("playlist", intParser()) playlist?: number,
  ) {
    const [items, count] = await Sound.findAndCount({
      where: {
        title: search && ILike(`%${search}%`),
        ownerId: user.discordId,
        tags: tags && In(tags),
        type,
        playlists: playlist ? { id: playlist } : undefined,
      },
      select: { data: false },
      take: pageSize,
      skip: page * pageSize,
    });
    return { items, count, page, pageSize, pages: Math.ceil(count / pageSize) };
  }

  @Get("/info")
  public async info(@Query("source") source: string) {
    return new ytdlp().getVideoInfo(source);
  }

  @Post("/", {
    before: [fileUpload({ limits: { fileSize: 52428800 /* 50mb */ } })],
  })
  public async create(
    @Session("user") user: User,
    @Req request: Request,
    @Body("title") title: string,
    @Body("tags") tags: string[] = [],
    @Body("type") type: SoundType = SoundType.Music,
    @Body("artist") artist?: string,
    @Body("thumbnail") thumbnail?: string,
    @Body("length") length?: string | number,
    @Body("source") source?: string,
    @File("data") file?: Buffer,
  ) {
    const info = source ? await this.info(source) : undefined;
    if (typeof length === "string") length = parseInt(length, 10);
    thumbnail ??= info?.thumbnail;
    length ??= info ? info.duration * 1000 : undefined;
    artist ??= info?.artist;
    title ??= info?.track ?? info?.title;
    tags ??= info.tags;

    const sound = Sound.create({
      ownerId: user.discordId,
      tags,
      artist,
      title,
      thumbnail,
      length,
      source,
      type,
    });
    sound.data = source
      ? await this.download(source)
      : await this.format(bufferToStream(file));
    await Sound.save(sound);
    const { data: _, ...data } = sound;
    return { data, status: 200 };
  }

  @Delete("/:id")
  public async remove(
    @Session("user") user: User,
    @Param("id", intParser()) id: number,
  ) {
    await Sound.delete({
      ownerId: user.discordId,
      id,
    });
  }

  async download(url: string) {
    const dlp = new ytdlp();
    const fileName = `tmp-${Date.now()}`;
    await dlp.execPromise([
      url,
      "-f",
      "best[ext=mp4]",
      "-x",
      "--audio-format",
      "opus",
      "-o",
      fileName,
    ]);
    const buffer = await fs.readFile(`${fileName}.opus`);
    await fs.unlink(`${fileName}.opus`);
    return buffer;
  }

  format(input: Stream) {
    return streamToBuffer(new FFmpeg(input).format("mp3"));
  }
}

function tagParser() {
  return (tags?: string) => {
    if (!tags) return;
    const result = tags
      .split(";")
      .map(it => it.trim())
      .filter(it => it);
    if (!result.length) return;
    return result;
  };
}
