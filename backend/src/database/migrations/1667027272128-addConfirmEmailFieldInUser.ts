import { MigrationInterface, QueryRunner } from "typeorm";

export class addConfirmEmailFieldInUser1667027272128 implements MigrationInterface {
    name = "addConfirmEmailFieldInUser1667027272128";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbType = queryRunner.connection.options.type;
        if (dbType === "postgres") {
            await queryRunner.query(`ALTER TABLE "users" ADD "is_email_confirmed" boolean NOT NULL DEFAULT false`);
            return;
        }
        if (dbType === "mysql") {
            await queryRunner.query(`ALTER TABLE users ADD is_email_confirmed boolean NOT NULL DEFAULT false`);
            return;
        }
        throw new Error(`Unsupported DB engine for migration addConfirmEmailFieldInUser1667027272128: ${dbType}`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbType = queryRunner.connection.options.type;
        if (dbType === "postgres") {
            await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_email_confirmed"`);
            return;
        }
        if (dbType === "mysql") {
            await queryRunner.query(`ALTER TABLE users DROP COLUMN is_email_confirmed`);
            return;
        }
        throw new Error(`Unsupported DB engine for migration addConfirmEmailFieldInUser1667027272128: ${dbType}`);
    }
}
