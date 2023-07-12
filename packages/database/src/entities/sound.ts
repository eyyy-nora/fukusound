import { Playlist } from "src/entities/playlist";
import { User } from "src/entities/user";
import { SoundType } from "src/enums/sound-type";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinTable,
  BaseEntity,
} from "typeorm";

@Entity("sound", { schema: "fukusound" })
export class Sound extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar", nullable: true })
  artist?: string;

  @Column({ type: "varchar", nullable: true })
  thumbnail?: string;

  @Column({ type: "varchar", array: true })
  tags: string[];

  @Column({ type: "varchar", nullable: true })
  source?: string;

  @Column({ type: "bytea", nullable: true })
  data?: Buffer;

  @Column({
    type: "enum",
    enum: SoundType,
    enumName: "SoundType",
    default: SoundType.Music,
  })
  type: SoundType;

  @Column("int", { default: 60000 })
  length: number;

  @Column("varchar")
  ownerId: string;

  @ManyToOne(() => User, u => u.sounds)
  @JoinColumn({
    name: "ownerId",
    referencedColumnName: "discordId",
    foreignKeyConstraintName: "FK_sound_ownerId_user_discordId",
  })
  user?: User;

  @ManyToMany(() => Playlist, playlist => playlist.sounds)
  @JoinTable({
    name: "sound_on_playlist",
    joinColumn: {
      name: "soundId",
      referencedColumnName: "id",
      foreignKeyConstraintName: "FK_sound_id",
    },
    inverseJoinColumn: {
      name: "playlistId",
      referencedColumnName: "id",
      foreignKeyConstraintName: "FK_playlist_id",
    },
  })
  playlists: Playlist[];
}
