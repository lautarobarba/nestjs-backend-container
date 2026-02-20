import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorGroupsToRoles1760700000000 implements MigrationInterface {
    name = "RefactorGroupsToRoles1760700000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "roles" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
                CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "roles" ("name")
            VALUES ('Administrador')
            ON CONFLICT ("name") DO NOTHING
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = 'groups'
                ) THEN
                    INSERT INTO "roles" ("name")
                    SELECT g."name"
                    FROM "groups" g
                    ON CONFLICT ("name") DO NOTHING;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users_roles" (
                "user_id" integer NOT NULL,
                "role_id" integer NOT NULL,
                CONSTRAINT "PK_users_roles" PRIMARY KEY ("user_id", "role_id"),
                CONSTRAINT "FK_users_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT "FK_users_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_users_roles_user_id" ON "users_roles" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_users_roles_role_id" ON "users_roles" ("role_id")
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = 'groups_users'
                ) AND EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = 'groups'
                ) THEN
                    INSERT INTO "users_roles" ("user_id", "role_id")
                    SELECT gu."user_id", r."id"
                    FROM "groups_users" gu
                    INNER JOIN "groups" g ON g."id" = gu."group_id"
                    INNER JOIN "roles" r ON r."name" = g."name"
                    ON CONFLICT ("user_id", "role_id") DO NOTHING;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = 'users'
                    AND column_name = 'role'
                ) THEN
                    INSERT INTO "roles" ("name")
                    SELECT DISTINCT
                        CASE
                            WHEN u."role"::text = 'ADMIN' THEN 'Administrador'
                            WHEN u."role"::text = 'USER' THEN 'Usuario'
                            ELSE u."role"::text
                        END
                    FROM "users" u
                    ON CONFLICT ("name") DO NOTHING;

                    INSERT INTO "users_roles" ("user_id", "role_id")
                    SELECT u."id", r."id"
                    FROM "users" u
                    INNER JOIN "roles" r
                        ON r."name" = CASE
                            WHEN u."role"::text = 'ADMIN' THEN 'Administrador'
                            WHEN u."role"::text = 'USER' THEN 'Usuario'
                            ELSE u."role"::text
                        END
                    ON CONFLICT ("user_id", "role_id") DO NOTHING;
                END IF;
            END $$;
        `);

        await queryRunner.query(`DROP TABLE IF EXISTS "groups_users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "groups"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_type t
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE t.typname = 'users_role_enum'
                    AND n.nspname = 'public'
                ) THEN
                    CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN');
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN IF NOT EXISTS "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER'
        `);

        await queryRunner.query(`
            UPDATE "users" u
            SET "role" = 'ADMIN'
            WHERE EXISTS (
                SELECT 1
                FROM "users_roles" ur
                INNER JOIN "roles" r ON r."id" = ur."role_id"
                WHERE ur."user_id" = u."id"
                AND r."name" = 'Administrador'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "groups" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "UQ_664ea405ae2a10c264d582ee563" UNIQUE ("name"),
                CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "groups" ("name")
            SELECT r."name"
            FROM "roles" r
            ON CONFLICT ("name") DO NOTHING
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "groups_users" (
                "group_id" integer NOT NULL,
                "user_id" integer NOT NULL,
                CONSTRAINT "PK_0dcbb207a5f954c29bfcf7a3921" PRIMARY KEY ("group_id", "user_id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_d8a1834cee7d6347016e3e55f0" ON "groups_users" ("group_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_7fff02b7fb30cd3730d90693de" ON "groups_users" ("user_id")
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints
                    WHERE table_schema = 'public'
                    AND table_name = 'groups_users'
                    AND constraint_name = 'FK_d8a1834cee7d6347016e3e55f04'
                ) THEN
                    ALTER TABLE "groups_users"
                    ADD CONSTRAINT "FK_d8a1834cee7d6347016e3e55f04"
                    FOREIGN KEY ("group_id") REFERENCES "groups"("id")
                    ON DELETE RESTRICT ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints
                    WHERE table_schema = 'public'
                    AND table_name = 'groups_users'
                    AND constraint_name = 'FK_7fff02b7fb30cd3730d90693dec'
                ) THEN
                    ALTER TABLE "groups_users"
                    ADD CONSTRAINT "FK_7fff02b7fb30cd3730d90693dec"
                    FOREIGN KEY ("user_id") REFERENCES "users"("id")
                    ON DELETE RESTRICT ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            INSERT INTO "groups_users" ("group_id", "user_id")
            SELECT g."id", ur."user_id"
            FROM "users_roles" ur
            INNER JOIN "roles" r ON r."id" = ur."role_id"
            INNER JOIN "groups" g ON g."name" = r."name"
            ON CONFLICT ("group_id", "user_id") DO NOTHING
        `);

        await queryRunner.query(`DROP TABLE IF EXISTS "users_roles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
    }
}
