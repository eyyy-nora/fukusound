import { Playlist } from "src/entities/playlist";
import { Sound } from "src/entities/sound";
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity("user", { schema: "fukusound" })
export class User extends BaseEntity {
  @PrimaryColumn({ type: "varchar" })
  discordId: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  avatar: string;

  @OneToMany(() => Sound, s => s.user, { cascade: true })
  sounds: Sound[];

  @OneToMany(() => Playlist, playlist => playlist.owner, { cascade: true })
  playlists: Playlist[];
}
