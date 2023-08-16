import { MediaPlayer } from "src/media/player";
import { Worker } from "src/worker/lib/decorators";

@Worker("./dist/worker/player.js")
export class PlayerWorker {
  player: MediaPlayer;
  userId: string;
}
