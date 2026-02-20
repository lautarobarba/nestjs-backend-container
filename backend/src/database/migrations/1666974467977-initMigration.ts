import { MigrationInterface, QueryRunner } from "typeorm";

export class initMigration1666974467977 implements MigrationInterface {
    name = "initMigration1666974467977";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbType = queryRunner.connection.options.type;

        if (dbType === "postgres") {
            await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
            await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`);
            await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "firstname" character varying(255) NOT NULL, "lastname" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "refresh_token" character varying(255), "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE', "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
            await queryRunner.query(`CREATE TABLE "notes" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, "user_id" integer, CONSTRAINT "UQ_236f4b6762c3c3786932d0786e7" UNIQUE ("title"), CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
            await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_7708dcb62ff332f0eaf9f0743a7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            return;
        }

        if (dbType === "mysql") {
            await queryRunner.query(`
                CREATE TABLE users (
                    id int NOT NULL AUTO_INCREMENT,
                    email varchar(255) NOT NULL,
                    firstname varchar(255) NOT NULL,
                    lastname varchar(255) NOT NULL,
                    password varchar(255) NOT NULL,
                    refresh_token varchar(255) NULL,
                    status enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
                    role enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
                    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    deleted tinyint(1) NOT NULL DEFAULT 0,
                    PRIMARY KEY (id),
                    UNIQUE KEY UQ_97672ac88f789774dd47f7c8be3 (email)
                )
            `);

            await queryRunner.query(`
                CREATE TABLE notes (
                    id int NOT NULL AUTO_INCREMENT,
                    title varchar(255) NOT NULL,
                    content text NOT NULL,
                    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    deleted tinyint(1) NOT NULL DEFAULT 0,
                    user_id int NULL,
                    PRIMARY KEY (id),
                    UNIQUE KEY UQ_236f4b6762c3c3786932d0786e7 (title),
                    CONSTRAINT FK_7708dcb62ff332f0eaf9f0743a7 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION
                )
            `);
            return;
        }

        throw new Error(`Unsupported DB engine for migration initMigration1666974467977: ${dbType}`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbType = queryRunner.connection.options.type;

        if (dbType === "postgres") {
            await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_7708dcb62ff332f0eaf9f0743a7"`);
            await queryRunner.query(`DROP TABLE "notes"`);
            await queryRunner.query(`DROP TABLE "users"`);
            await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
            await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
            return;
        }

        if (dbType === "mysql") {
            await queryRunner.query(`DROP TABLE IF EXISTS notes`);
            await queryRunner.query(`DROP TABLE IF EXISTS users`);
            return;
        }

        throw new Error(`Unsupported DB engine for migration initMigration1666974467977: ${dbType}`);
    }
}
