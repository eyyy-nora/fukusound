import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
} from "@discordjs/voice";
import { Playlist, Sound, User } from "@fukumong/database";
import { isDev } from "@fukumong/util";
import {
  Catch,
  floatParser,
  Get,
  intParser,
  Param,
  Post,
  Query,
  Service,
  Session,
} from "@propero/easy-api";
import chalk from "chalk";
import fs from "node:fs/promises";
import { discord } from "src/init/discord";
import { log } from "src/init/util";
import { Mount } from "src/mount";
import { EntityNotFoundError } from "typeorm";

function bool(val: any) {
  return val == null ? undefined : val === "true";
}

@Mount()
@Service("/media")
export class MediaController {
  players: Record<string, MediaPlayer> = {};
  connections: Record<string, VoiceConnection> = {};

  constructor() {
    discord.on("voiceStateUpdate", async (oldState, state) => {
      if (state.channelId === oldState?.channelId) return;
      if (!state.channelId && this.players[oldState.member.id]) {
        const connection = this.connections[oldState.guild.id];
        if (!connection) return;
        const connected = oldState.guild.members.cache
          .map(m => m.voice)
          .filter(it => it.channelId === connection.joinConfig.channelId);
        if (connected.length === 1) {
          await this.connections[oldState.guild.id].disconnect();
          await this.players[oldState.member.id]?.destroy();
          delete this.connections[oldState.guild.id];
          delete this.players[oldState.member.id];
        }
      }
    });
  }

  @Get("/now-playing")
  async getNowPlaying(@Session("user") user: User) {
    const {
      state,
      shuffle,
      repeat,
      time,
      media,
      volume,
      queue,
      index,
      title: queueTitle,
    } = await this.player(user.discordId);
    const { title, artist, length = -1, thumbnail, id } = media ?? {};
    return {
      state,
      shuffle,
      repeat,
      time,
      title,
      artist,
      length,
      thumbnail,
      id,
      volume,
      index,
      queueTitle,
      queue: queue.map(({ id, length, thumbnail, title, artist }) => ({
        id,
        length,
        thumbnail,
        title,
        artist,
      })),
    };
  }

  @Post("/settings")
  async onSettingsChange(
    @Session("user") user: User,
    @Query("shuffle", bool) shuffle?: boolean,
    @Query("repeat") repeat?: string,
    @Query("volume", floatParser()) volume?: number,
  ) {
    const player = await this.player(user.discordId);
    if (shuffle != null) player.shuffle = shuffle;
    if (repeat != null) player.repeat = repeat;
    if (volume != null) player.setVolume(volume);
    return this.getNowPlaying(user);
  }

  @Post("/pause")
  async onPause(@Session("user") user: User) {
    const player = await this.player(user.discordId);
    player.pause();
    return this.getNowPlaying(user);
  }

  @Post("/resume")
  async onResume(@Session("user") user: User) {
    const player = await this.player(user.discordId);
    player.resume();
    return this.getNowPlaying(user);
  }

  @Post("/skip-forward")
  async onSkipForward(@Session("user") user: User) {
    const player = await this.player(user.discordId);
    await player.skipForward();
    return this.getNowPlaying(user);
  }

  @Post("/skip-backward")
  async onSkipBackward(@Session("user") user: User) {
    const player = await this.player(user.discordId);
    await player.skipBackward();
    return this.getNowPlaying(user);
  }

  @Post("/skip-to/:id")
  async onSkipTo(@Session("user") user: User, @Param("id") id: number) {
    const player = await this.player(user.discordId);
    await player.skipTo(id);
    return this.getNowPlaying(user);
  }

  @Post("/play/:id")
  async onPlaySound(
    @Param("id", intParser()) id: number,
    @Session("user") user: User,
  ) {
    const sound = await Sound.findOneBy({ id, ownerId: user.discordId });
    const player = await this.player(user.discordId, true);
    await player.playOne(sound);
    return this.getNowPlaying(user);
  }

  @Post("/play-playlist/:id")
  async onPlayPlaylist(
    @Session("user") user: User,
    @Param("id", intParser()) id: number,
    @Query("songId", intParser()) songId?: number,
  ) {
    const { sounds } = await Playlist.findOne({
      where: { id, ownerId: user.discordId },
      relations: ["sounds"],
    });
    if (!Number.isFinite(songId)) songId = sounds[0].id;
    const player = await this.player(user.discordId, true);
    await player.playMany(
      sounds,
      sounds.findIndex(it => it.id === songId) ?? 0,
    );
    return this.getNowPlaying(user);
  }

  @Post("/queue-playlist/:id")
  async onQueuePlaylist(
    @Session("user") user: User,
    @Param("id", intParser()) id: number,
  ) {
    const list = await Playlist.findOne({
      where: { id, ownerId: user.discordId },
      relations: ["sounds"],
    });
    const player = await this.player(user.discordId, true);
    await player.queueMany(list.sounds);
    player.playlist = list;
    return this.getNowPlaying(user);
  }

  @Post("/queue/:id")
  async onQueueSound(
    @Param("id", intParser()) id: number,
    @Session("user") user: User,
  ) {
    const sound = await Sound.findOne({
      where: { id, ownerId: user.discordId },
      select: { data: true },
    });
    const player = await this.player(user.discordId);
    player.queueOne(sound);
    return this.getNowPlaying(user);
  }

  @Post("/unqueue/:index")
  async onUnqueueSound(
    @Param("index", intParser()) index: number,
    @Session("user") user: User,
  ) {
    const player = await this.player(user.discordId);
    await player.unqueue(index);
    return this.getNowPlaying(user);
  }

  @Post("/save-queue")
  async onSaveQueue(@Session("user") user: User, @Query("name") name: string) {
    const player = await this.player(user.discordId);
    const { queue, playlist } = player;
    const list = Playlist.create({
      name,
      ownerId: user.discordId,
      sounds: queue,
    });
    list.id = playlist?.id;
    await Playlist.save(list);
    player.playlist = list;
    return { name: list.name, id: list.id, ownerId: user.discordId };
  }

  async player(id: string, autoJoin = false) {
    if (!id) throw new Error("401 Unauthorized");
    if (autoJoin) await this.joinChannel(id);
    return (this.players[id] ??= new MediaPlayer());
  }

  @Catch({ classes: [EntityNotFoundError] })
  async onError() {
    throw new Error("404 Not Found");
  }

  async joinChannel(userId: string) {
    const state = discord.guilds.cache
      .map(it =>
        it.voiceStates.cache.find(
          it => it.member.user.id === userId && it.channelId,
        ),
      )
      .filter(it => it)[0];
    if (!state) throw new Error("400 Bad Request");
    if (
      this.connections[state.guild.id]?.joinConfig?.channelId ===
      state.channelId
    )
      return;
    const guildName = chalk.cyanBright(state.guild.name);
    const channelName = chalk.cyanBright(state.channel.name);
    log(`joining ${guildName} >>> ${channelName}`);
    const con = (this.connections[state.guild.id] = joinVoiceChannel({
      channelId: state.channelId,
      guildId: state.guild.id,
      adapterCreator: state.guild.voiceAdapterCreator,
    }));
    con.subscribe((await this.player(userId)).player);
  }
}

class MediaPlayer {
  shuffle = false;
  repeat = "none";
  state = "paused";
  time = 0;
  volume = 0.4;
  media?: Sound;
  playlist?: Playlist;
  title = "Queue";
  queue: Sound[] = [];
  index: number;
  _player!: AudioPlayer;
  _resource?: AudioResource;

  setVolume(volume: number) {
    this.volume = volume;
    this._resource?.volume?.setVolume(volume);
  }

  get player() {
    return (this._player ??= this.createPlayer());
  }
  async playOne(sound: Sound) {
    this.queue = [sound];
    this.index = 0;
    await this.playSound(sound);
  }

  async playMany(sounds: Sound[], index: number) {
    this.queue = sounds;
    this.index = index;
    this.media = this.queue[this.index];
    if (this.media) await this.playSound(this.media);
  }

  async playSound(sound: Sound) {
    this.media = sound;
    await fs.writeFile("current.mp3", sound.data);
    this._resource = createAudioResource("current.mp3", {
      inlineVolume: true,
      inputType: StreamType.Opus,
    });
    this._resource.volume.setVolume(this.volume);
    this.player.play(this._resource);
    this.state = "playing";
  }

  queueOne(sound: Sound) {
    this.queue.push(sound);
  }

  queueMany(sounds: Sound[]) {
    this.queue.push(...sounds);
  }

  async unqueue(index: number) {
    if (this.queue.length === 1) {
      this.queue = [];
      this.media = undefined;
      this.index = -1;
      this.player.stop();
    } else {
      if (this.index === index) await this.skipForward();
      this.queue.splice(index, 1);
      if (this.index >= index) this.index--;
    }
  }

  resume() {
    this.player.unpause();
    this.state = "playing";
  }

  pause() {
    this.player.pause();
    this.state = "paused";
  }

  createPlayer() {
    const player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Play },
      debug: isDev(),
    });
    player.on(AudioPlayerStatus.Idle, this.onPlayerIdle.bind(this));
    return player;
  }

  onPlayerIdle() {
    switch (this.repeat) {
      case "one":
        if (this.media) this.playSound(this.media).then();
        break;
      default:
        this.skipForward();
    }
  }

  async skipForward() {
    this.index++;
    if (this.queue.length <= this.index && this.repeat !== "none") {
      this.index = 0;
      if (this.shuffle) shuffle(this.queue);
    }
    const media = (this.media = this.queue[this.index]);
    if (media) await this.playSound(media);
  }

  async skipBackward() {
    if (this.index === 0 && this.repeat === "none") return;
    if (this.index === 0) this.index = this.queue.length;
    const media = (this.media = this.queue[--this.index]);
    if (media) await this.playSound(media);
  }

  async skipTo(index: number) {
    this.index = index;
    const media = (this.media = this.queue[this.index]);
    if (media) await this.playSound(media);
  }

  async destroy() {
    this.player.stop(true);
    // todo: destroy
  }
}

function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
