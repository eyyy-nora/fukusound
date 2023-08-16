import { db, Sound } from "@fukumong/database";
import { WorkerThread } from "src/util/worker-threads";
import ytdlp from "yt-dlp-wrap";
import fs from "node:fs/promises";

@WorkerThread("./dist/media/download/youtube.js")
export class YoutubeProcessor {
  _queue: {
    url: string;
    id: number;
  }[] = [];
  _working?: Promise<void>;
  _ytdlp!: ytdlp;

  @WorkerThread.Init
  async onInit() {
    await db.initialize();
    try {
      await fs.access("./yt-dlp");
    } catch {
      await ytdlp.downloadFromGithub();
    }
    this._ytdlp = new ytdlp();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  @WorkerThread.Forward
  async queue(id: number, url: string) {
    this._queue.push({ url, id });
    if (!this._working) await (this._working = this.work());
    else await this._working;
    this._working = undefined;
    return this._queue;
  }

  async work() {
    if (!this._queue.length) {
      return;
    }
    const { id, url } = this._queue.shift()!;
    const fileName = `tmp-${Date.now()}`;
    await new Promise((resolve, reject) => {
      this._ytdlp
        .exec([url, "-x", "--audio-format", "opus", "-o", fileName])
        .on("progress", progress => console.log("progress", progress))
        .on("ytDlpEvent", (type, data) => console.log("ytldp", type, data))
        .on("error", reject)
        .on("close", resolve);
    });

    await this._ytdlp.execPromise([
      url,
      "-x",
      "--audio-format",
      "opus",
      "-o",
      fileName,
    ]);
    const buffer = await fs.readFile(`${fileName}.opus`);
    await fs.unlink(`${fileName}.opus`);
    await Sound.update({ id }, { data: buffer });
    await this.work();
  }
}
