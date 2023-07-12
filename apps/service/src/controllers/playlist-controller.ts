import { Playlist, User } from "@fukumong/database";
import {
  Delete,
  Get,
  intParser,
  Param,
  Query,
  Service,
  Session,
} from "@propero/easy-api";
import { Mount } from "src/mount";
import { ILike } from "typeorm";

@Mount("/playlists")
@Service()
export class PlaylistController {
  @Get("/")
  public async list(
    @Session("user") user: User,
    @Query("search") search: string = "",
    @Query("page", intParser()) page = 0,
    @Query("pageSize", intParser()) pageSize = 24,
  ) {
    const [items, count] = await Playlist.findAndCount({
      where: {
        name: search ? ILike(`%${search}%`) : undefined,
        ownerId: user.discordId,
      },
      relations: { sounds: true },
      select: {
        sounds: { data: false, thumbnail: true, length: true, id: true },
      },
      take: pageSize,
      skip: page * pageSize,
      relationLoadStrategy: "join",
    });
    return { items, count, page, pageSize, pages: Math.ceil(count / pageSize) };
  }

  @Delete("/:id")
  public async remove(
    @Session("user") user: User,
    @Param("id", intParser()) id: number,
  ) {
    await Playlist.delete({
      ownerId: user.discordId,
      id,
    });
    return { success: true };
  }
}
