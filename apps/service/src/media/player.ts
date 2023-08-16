import {
  AudioPlayer,
  AudioResource,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
} from "@discordjs/voice";
import { Playlist, Sound } from "@fukumong/database";
import { AudioContext } from "node-web-audio-api";
import EventEmitter from "node:events";
import { Readable } from "node:stream";
import { discord } from "src/init/discord";
import { MediaQueue } from "src/media/queue";
import { select } from "src/util/select";

export enum RepeatMode {
  One = "one",
  All = "all",
  None = "none",
}

export class MediaPlayer extends EventEmitter {
  private readonly audioContext: AudioContext;
  private readonly gainNode: GainNode;
  private readonly queue: MediaQueue;
  private bufferSource: AudioBufferSourceNode | null = null;
  private playing = false;
  private shuffle = false;
  private repeat: RepeatMode = RepeatMode.None;
  private fadeDuration = 0.15; // 150ms
  private connection: VoiceConnection;
  private player: AudioPlayer;
  private resource: AudioResource;
  private destination: MediaStreamAudioDestinationNode;
  private recorder: MediaRecorder;
  private readable: Readable;

  constructor() {
    super();
    this.audioContext = new AudioContext();
    debugger;
    this.destination = this.audioContext.createMediaStreamDestination();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.destination);
    this.queue = new MediaQueue();
    this.player = new AudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Play },
    });
    this.recorder = new MediaRecorder(this.destination.stream);
    this.readable = new Readable();
    this.recorder.addEventListener(
      "dataavailable",
      this.forwardData.bind(this),
    );
    this.resource = createAudioResource(this.readable, {
      inputType: StreamType.Raw,
    });
    this.emit("initialised", this);
  }

  private forwardData(data: Blob) {
    this.readable.push(data);
  }

  public get time(): number {
    return this.audioContext.currentTime;
  }

  public set time(value: number) {
    this.seek(value).then();
  }

  public get length() {
    return this.bufferSource?.buffer?.duration ?? 0;
  }

  public get gain() {
    return this.gainNode.gain;
  }

  public get volume() {
    return this.gain.value;
  }

  public set volume(volume: number) {
    const gain = this.gain;
    gain.cancelScheduledValues(this.time);
    gain.setValueAtTime(gain.value, this.time);
    gain.linearRampToValueAtTime(volume, this.time + this.fadeDuration);
  }

  public async resume() {
    if (this.playing) return;
    this.playing = true;
    await this.loadAndPlayCurrentTrack(this.time);
    this.emit("play", this);
    const id = setInterval(() => this.emit("progress", this), 250);
    this.once("pause", () => clearInterval(id));
  }

  public pause() {
    if (!this.playing) return;
    this.playing = false;
    this.audioContext.suspend();
    this.emit("pause", this);
  }

  public async play(item: Sound | Playlist, queue = false) {
    if (queue) {
      this.queue.add(item as any);
    } else {
      this.queue.replace(item as any);
      this.pause();
      await this.resume();
    }
  }

  public async seek(position: number) {
    if (!this.bufferSource) return;
    this.bufferSource.stop();
    this.bufferSource.disconnect();
    await this.loadAndPlayCurrentTrack(position);
  }

  public toggleRepeat(value?: RepeatMode) {
    if (value) this.repeat = value;
    else
      this.repeat = select(this.repeat, {
        [RepeatMode.None]: RepeatMode.All,
        [RepeatMode.All]: RepeatMode.One,
        [RepeatMode.One]: RepeatMode.None,
      });
  }

  public toggleShuffle(shuffle = !this.shuffle) {
    this.shuffle = shuffle;
  }

  private async loadAndPlayCurrentTrack(startTime: number = 0) {
    if (!this.queue.length) return;
    const currentTrack = this.queue.current;
    const audioBuffer: AudioBuffer = this.audioContext.decodeAudioData(
      currentTrack.data!,
    );
    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = audioBuffer;
    this.bufferSource.connect(this.gainNode);
    this.bufferSource.addEventListener("ended", this.onTrackEnded.bind(this));
    if (startTime > 0) this.bufferSource.start(0, startTime);
    else this.bufferSource.start();
  }

  private async onTrackEnded() {
    if (this.repeat === RepeatMode.One) await this.loadAndPlayCurrentTrack();
    else if (!this.queue.hasNext() && this.repeat !== RepeatMode.All) {
      this.playing = false;
      return;
    } else {
      if (!this.queue.hasNext() && this.shuffle) this.queue.shuffle();
      this.queue.next();
      await this.loadAndPlayCurrentTrack();
    }
  }

  public async connect(userId: string) {
    const state = discord.guilds.cache
      .map(it => it.voiceStates.cache.find(it => it.member.user.id === userId))
      .filter(Boolean)[0];
    if (!state) throw new Error("No shared channels");
    if (this.connection?.joinConfig.channelId === state.channelId) return;
    this.connection = joinVoiceChannel({
      channelId: state.channelId,
      guildId: state.guild.id,
      adapterCreator: state.guild.voiceAdapterCreator,
    });
    this.connection.subscribe(this.player);
  }
}
