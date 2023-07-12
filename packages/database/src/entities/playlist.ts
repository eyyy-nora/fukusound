import { Sound } from "src/entities/sound";
import { User } from "src/entities/user";
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  BaseEntity,
} from "typeorm";

@Entity("playlist", { schema: "fukusound" })
export class Playlist extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  ownerId: string;

  @Column("varchar")
  name: string;

  @ManyToMany(() => Sound, sound => sound.playlists, {
    cascade: true,
    onDelete: "CASCADE",
  })
  sounds: Sound[];

  @ManyToOne(() => User, user => user.playlists)
  @JoinColumn({
    name: "ownerId",
    referencedColumnName: "discordId",
    foreignKeyConstraintName: "FK_playlist_ownerId_user_discordId",
  })
  owner: User;
}
