import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaChanges1687985165315 implements MigrationInterface {
  name = "SchemaChanges1687985165315";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema("fukusound", true);
    await queryRunner.query(`
            CREATE TABLE "fukusound"."user" (
                "discordId" character varying NOT NULL,
                "name" character varying NOT NULL,
                "avatar" character varying NOT NULL,
                CONSTRAINT "PK_13af5754f14d8d255fd9b3ee5c7" PRIMARY KEY ("discordId")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "fukusound"."SoundType" AS ENUM('music', 'effect')
        `);
    await queryRunner.query(`
            CREATE TABLE "fukusound"."sound" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "tags" character varying NOT NULL,
                "description" character varying(1024) NOT NULL,
                "source" character varying,
                "data" bytea,
                "type" "fukusound"."SoundType" NOT NULL DEFAULT 'music',
                "length" integer NOT NULL DEFAULT '60000',
                "ownerId" character varying NOT NULL,
                CONSTRAINT "PK_042a7f5e448107b2fd0eb4dfe8c" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "fukusound"."playlist" (
                "id" SERIAL NOT NULL,
                "ownerId" character varying NOT NULL,
                CONSTRAINT "PK_538c2893e2024fabc7ae65ad142" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "fukusound"."session" (
                "expiredAt" bigint NOT NULL,
                "id" character varying(255) NOT NULL,
                "json" text NOT NULL,
                "destroyedAt" TIMESTAMP,
                CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "fukusound"."session" ("expiredAt")
        `);
    await queryRunner.query(`
            CREATE TABLE "fukusound"."sound_on_playlist" (
                "soundId" integer NOT NULL,
                "playlistId" integer NOT NULL,
                CONSTRAINT "PK_4d6e6761cac760cf6a0e1c5a4c9" PRIMARY KEY ("soundId", "playlistId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c1a5f85978e65b412802c7d72f" ON "fukusound"."sound_on_playlist" ("soundId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_a998c1c9dfa29467d7f714a477" ON "fukusound"."sound_on_playlist" ("playlistId")
        `);
    await queryRunner.query(`
            ALTER TABLE "fukusound"."sound"
            ADD CONSTRAINT "FK_sound_ownerId_user_discordId" FOREIGN KEY ("ownerId") REFERENCES "fukusound"."user"("discordId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "fukusound"."playlist"
            ADD CONSTRAINT "FK_playlist_ownerId_user_discordId" FOREIGN KEY ("ownerId") REFERENCES "fukusound"."user"("discordId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "fukusound"."sound_on_playlist"
            ADD CONSTRAINT "FK_sound_id" FOREIGN KEY ("soundId") REFERENCES "fukusound"."sound"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "fukusound"."sound_on_playlist"
            ADD CONSTRAINT "FK_playlist_id" FOREIGN KEY ("playlistId") REFERENCES "fukusound"."playlist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropSchema("fukusound", true, true);
  }
}
