import { db, Sound } from "@fukumong/database";
import fs from "node:fs/promises";
import { sleep } from "src/util/sleep";
import { Worker } from "src/worker/lib/decorators";
import { ProgressPromise } from "src/worker/lib/progress-promise";
import ytdlp from "yt-dlp-wrap";

interface DownloadQueueEntry {
  id: number;
  url: string;
  resolve: (result: any) => void;
  reject: (result: any) => void;
  progress: (stage: string, progress: number) => void;
  filename?: string;
  buffer?: Buffer;
}

@Worker("./dist/worker/youtube.js")
export class Youtube {
  private ytdlp: ytdlp;
  private queue: DownloadQueueEntry[] = [];
  private working = false;

  @Worker.Init()
  async onInit() {
    await db.initialize();
    try {
      await fs.access("./yt-dlp");
    } catch {
      await ytdlp.downloadFromGithub();
    }
    this.ytdlp = new ytdlp();
    await sleep(5000);
  }

  @Worker.Method()
  download(id: number, url: string) {
    return new ProgressPromise(async (resolve, reject, progress) => {
      progress("queued", 0);
      this.queue.push({ id, url, resolve, reject, progress });
      if (!this.working) this.work().then();
    });
  }

  private async work() {
    if (this.working) return;
    if (!this.queue.length) return;
    this.working = true;

    do {
      const entry = this.queue.shift()!;
      try {
        await this._download(entry);
        await this._process(entry);
        await this._upload(entry);
      } catch (error) {
        entry.reject(error);
      }
    } while (this.queue.length);
  }

  private async _download(entry: DownloadQueueEntry) {
    const fn = (entry.filename = `tmp-${Date.now()}-${Math.random()}.opus`);
    const url = entry.url;
    entry.progress("downloading", 0);
    await new Promise((resolve, reject) => {
      this.ytdlp
        .exec([url, "-x", "--audio-format", "opus", "-o", fn])
        .on("progress", p => entry.progress("downloading", p.percent ?? 0))
        .on("error", reject)
        .on("close", resolve);
    });
  }

  private async _process(entry: DownloadQueueEntry) {
    entry.progress("processing", 0);
    entry.buffer = await fs.readFile(entry.filename);
    // todo: figure out metadata
    await fs.unlink(entry.filename);
  }

  private async _upload(entry: DownloadQueueEntry) {
    entry.progress("uploading", 0);
    const { id, buffer: data } = entry;
    await Sound.update({ id }, { data });
  }
}
