import { Readable, Stream } from "node:stream";

export function streamToBuffer(stream: Stream) {
  return new Promise<Buffer>((resolve, reject) => {
    const buffers: Buffer[] = [];
    stream.on("data", data => buffers.push(data));
    stream.on("end", err => {
      if (err) reject(err);
      else resolve(Buffer.from(buffers as any));
    });
    stream.on("close", () => resolve(Buffer.from(buffers as any)));
    stream.on("error", reject);
  });
}

export function bufferToStream(buffer: Buffer) {
  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
}
