import { Sound } from "@fukumong/database";
// import { YoutubeProcessor } from "src/media/download/youtube";
import { MediaPlayer } from "src/media/player";

export async function main() {
  console.log("starting worker thread");
  const player = new MediaPlayer();
  const sound = await Sound.findOneOrFail({
    where: { id: 3 },
  });
  await player.connect("266592999549566988");
  await player.play(sound);
  console.log("over!");
}

main();
