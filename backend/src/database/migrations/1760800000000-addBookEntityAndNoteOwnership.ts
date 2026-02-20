import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookEntityAndNoteOwnership1760800000000
  implements MigrationInterface
{
  name = "AddBookEntityAndNoteOwnership1760800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "books" (
        "id" SERIAL NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted" boolean NOT NULL DEFAULT false,
        "user_id" integer NOT NULL,
        CONSTRAINT "PK_books_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_books_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "notes"
      ADD COLUMN IF NOT EXISTS "book_id" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "notes"
      ADD CONSTRAINT "FK_notes_book_id"
      FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `).catch(async () => {
      // constraint exists
    });

    await queryRunner.query(`
      INSERT INTO "books" ("title", "description", "user_id")
      SELECT DISTINCT
        CONCAT('Libro migrado usuario ', n."user_id"),
        'Libro creado automaticamente por migracion',
        n."user_id"
      FROM "notes" n
      WHERE n."user_id" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM "books" b
        WHERE b."user_id" = n."user_id"
        AND b."title" = CONCAT('Libro migrado usuario ', n."user_id")
      )
    `);

    await queryRunner.query(`
      UPDATE "notes" n
      SET "book_id" = b."id"
      FROM "books" b
      WHERE n."user_id" = b."user_id"
      AND b."title" = CONCAT('Libro migrado usuario ', n."user_id")
      AND n."book_id" IS NULL
    `);

    await queryRunner.query(`
      DO $$
      DECLARE
        fallback_user_id integer;
        fallback_book_id integer;
      BEGIN
        IF EXISTS (SELECT 1 FROM "notes" WHERE "book_id" IS NULL) THEN
          SELECT "id" INTO fallback_user_id FROM "users" ORDER BY "id" ASC LIMIT 1;
          IF fallback_user_id IS NOT NULL THEN
            INSERT INTO "books" ("title", "description", "user_id")
            VALUES ('Libro migrado sin usuario', 'Libro fallback generado por migracion', fallback_user_id)
            ON CONFLICT DO NOTHING;

            SELECT "id" INTO fallback_book_id
            FROM "books"
            WHERE "title" = 'Libro migrado sin usuario'
            AND "user_id" = fallback_user_id
            ORDER BY "id" ASC
            LIMIT 1;

            UPDATE "notes"
            SET "book_id" = fallback_book_id
            WHERE "book_id" IS NULL;
          END IF;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "notes"
      DROP CONSTRAINT IF EXISTS "FK_7708dcb62ff332f0eaf9f0743a7"
    `);

    await queryRunner.query(`
      ALTER TABLE "notes"
      DROP COLUMN IF EXISTS "user_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notes"
      ADD COLUMN IF NOT EXISTS "user_id" integer
    `);

    await queryRunner.query(`
      UPDATE "notes" n
      SET "user_id" = b."user_id"
      FROM "books" b
      WHERE n."book_id" = b."id"
      AND n."user_id" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "notes"
      DROP CONSTRAINT IF EXISTS "FK_notes_book_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "notes"
      ADD CONSTRAINT "FK_7708dcb62ff332f0eaf9f0743a7"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `).catch(async () => {
      // already exists
    });

    await queryRunner.query(`
      ALTER TABLE "notes"
      DROP COLUMN IF EXISTS "book_id"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "books"
    `);
  }
}
