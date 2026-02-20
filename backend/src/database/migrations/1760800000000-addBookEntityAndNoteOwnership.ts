import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookEntityAndNoteOwnership1760800000000
  implements MigrationInterface
{
  name = "AddBookEntityAndNoteOwnership1760800000000";

  private isPostgres(queryRunner: QueryRunner): boolean {
    return queryRunner.connection.options.type === "postgres";
  }

  private isMysql(queryRunner: QueryRunner): boolean {
    return queryRunner.connection.options.type === "mysql";
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (this.isPostgres(queryRunner)) {
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
      await queryRunner.query(`ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "book_id" integer`);
      await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_notes_book_id" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE`).catch(async () => {});
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
      await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT IF EXISTS "FK_7708dcb62ff332f0eaf9f0743a7"`);
      await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN IF EXISTS "user_id"`);
      return;
    }

    if (this.isMysql(queryRunner)) {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS books (
          id int NOT NULL AUTO_INCREMENT,
          title varchar(255) NOT NULL,
          description text NULL,
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted tinyint(1) NOT NULL DEFAULT 0,
          user_id int NOT NULL,
          PRIMARY KEY (id),
          CONSTRAINT FK_books_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
        )
      `);

      if (!(await queryRunner.hasColumn("notes", "book_id"))) {
        await queryRunner.query(`ALTER TABLE notes ADD book_id int NULL`);
      }

      await queryRunner.query(`
        ALTER TABLE notes
        ADD CONSTRAINT FK_notes_book_id
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT ON UPDATE CASCADE
      `).catch(async () => {});

      await queryRunner.query(`
        INSERT INTO books (title, description, user_id)
        SELECT DISTINCT
          CONCAT('Libro migrado usuario ', n.user_id),
          'Libro creado automaticamente por migracion',
          n.user_id
        FROM notes n
        WHERE n.user_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM books b
          WHERE b.user_id = n.user_id
          AND b.title = CONCAT('Libro migrado usuario ', n.user_id)
        )
      `);

      await queryRunner.query(`
        UPDATE notes n
        JOIN books b ON b.user_id = n.user_id
          AND b.title = CONCAT('Libro migrado usuario ', n.user_id)
        SET n.book_id = b.id
        WHERE n.book_id IS NULL
      `);

      const notesWithoutBook: Array<{ count: number }> = await queryRunner.query(
        `SELECT COUNT(*) AS count FROM notes WHERE book_id IS NULL`,
      );
      if (Number(notesWithoutBook[0]?.count ?? 0) > 0) {
        const firstUser: Array<{ id: number }> = await queryRunner.query(
          `SELECT id FROM users ORDER BY id ASC LIMIT 1`,
        );
        const fallbackUserId = firstUser[0]?.id;
        if (fallbackUserId) {
          await queryRunner.query(`
            INSERT INTO books (title, description, user_id)
            SELECT 'Libro migrado sin usuario', 'Libro fallback generado por migracion', ${fallbackUserId}
            FROM DUAL
            WHERE NOT EXISTS (
              SELECT 1 FROM books WHERE title = 'Libro migrado sin usuario' AND user_id = ${fallbackUserId}
            )
          `);
          const fallbackBook: Array<{ id: number }> = await queryRunner.query(
            `SELECT id FROM books WHERE title = 'Libro migrado sin usuario' AND user_id = ${fallbackUserId} ORDER BY id ASC LIMIT 1`,
          );
          const fallbackBookId = fallbackBook[0]?.id;
          if (fallbackBookId) {
            await queryRunner.query(`UPDATE notes SET book_id = ${fallbackBookId} WHERE book_id IS NULL`);
          }
        }
      }

      await queryRunner.query(`ALTER TABLE notes DROP FOREIGN KEY FK_7708dcb62ff332f0eaf9f0743a7`).catch(async () => {});
      if (await queryRunner.hasColumn("notes", "user_id")) {
        await queryRunner.query(`ALTER TABLE notes DROP COLUMN user_id`);
      }
      return;
    }

    throw new Error(
      `Unsupported DB engine for migration AddBookEntityAndNoteOwnership1760800000000: ${queryRunner.connection.options.type}`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (this.isPostgres(queryRunner)) {
      await queryRunner.query(`ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "user_id" integer`);
      await queryRunner.query(`
        UPDATE "notes" n
        SET "user_id" = b."user_id"
        FROM "books" b
        WHERE n."book_id" = b."id"
        AND n."user_id" IS NULL
      `);
      await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT IF EXISTS "FK_notes_book_id"`);
      await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_7708dcb62ff332f0eaf9f0743a7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`).catch(async () => {});
      await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN IF EXISTS "book_id"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "books"`);
      return;
    }

    if (this.isMysql(queryRunner)) {
      if (!(await queryRunner.hasColumn("notes", "user_id"))) {
        await queryRunner.query(`ALTER TABLE notes ADD user_id int NULL`);
      }
      await queryRunner.query(`
        UPDATE notes n
        JOIN books b ON b.id = n.book_id
        SET n.user_id = b.user_id
        WHERE n.user_id IS NULL
      `);
      await queryRunner.query(`ALTER TABLE notes DROP FOREIGN KEY FK_notes_book_id`).catch(async () => {});
      await queryRunner.query(`ALTER TABLE notes ADD CONSTRAINT FK_7708dcb62ff332f0eaf9f0743a7 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`).catch(async () => {});
      if (await queryRunner.hasColumn("notes", "book_id")) {
        await queryRunner.query(`ALTER TABLE notes DROP COLUMN book_id`);
      }
      await queryRunner.query(`DROP TABLE IF EXISTS books`);
      return;
    }

    throw new Error(
      `Unsupported DB engine for migration AddBookEntityAndNoteOwnership1760800000000: ${queryRunner.connection.options.type}`,
    );
  }
}
