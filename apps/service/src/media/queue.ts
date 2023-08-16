import { Playlist, Sound } from "@fukumong/database";

export class MediaQueue {
  public trackList: Sound[];
  public playlist?: Playlist;
  public index: number = 0;

  public get length() {
    return this.trackList.length;
  }

  public get current() {
    return this.trackList[this.index];
  }

  public hasNext() {
    return this.trackList.length > this.index + 1;
  }

  public hasPrev() {
    return this.index > 0;
  }

  public next() {
    this.index = (this.index + 1) % this.trackList.length;
  }

  public prev() {
    this.index -= 1;
    if (this.index < 0) this.index = this.trackList.length - 1;
  }

  public shuffle() {
    const current = this.current;
    const list = this.trackList.slice();
    list.splice(this.index, 1);
    for (let i = list.length - 1; i > 0; i--) {
      const random = Math.floor(Math.random() * (i + 1));
      [list[i], list[random]] = [list[random], list[i]];
    }
    list.push(current);
    this.index = 0;
  }

  public add(playlist: Playlist): void;
  public add(sound: Sound): void;
  public add(item: Sound | Playlist) {
    const sounds = item instanceof Playlist ? item.sounds : [item];
    this.trackList.push(...sounds);
  }

  public replace(playlist: Playlist): void;
  public replace(sound: Sound): void;
  public replace(item: Sound | Playlist) {
    this.trackList = item instanceof Playlist ? item.sounds : [item];
    this.index = 0;
  }

  public remove(sound: Sound | number) {
    const index =
      typeof sound === "number" ? sound : this.trackList.indexOf(sound);
    this.trackList.splice(index, 1);
    if (this.index > index) this.prev();
  }
}
