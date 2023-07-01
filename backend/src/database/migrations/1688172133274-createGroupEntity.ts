import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGroupEntity1688172133274 implements MigrationInterface {
    name = 'CreateGroupEntity1688172133274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "groups" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_664ea405ae2a10c264d582ee563" UNIQUE ("name"), CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "groups_users" ("group_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_0dcbb207a5f954c29bfcf7a3921" PRIMARY KEY ("group_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d8a1834cee7d6347016e3e55f0" ON "groups_users" ("group_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7fff02b7fb30cd3730d90693de" ON "groups_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "groups_users" ADD CONSTRAINT "FK_d8a1834cee7d6347016e3e55f04" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups_users" ADD CONSTRAINT "FK_7fff02b7fb30cd3730d90693dec" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups_users" DROP CONSTRAINT "FK_7fff02b7fb30cd3730d90693dec"`);
        await queryRunner.query(`ALTER TABLE "groups_users" DROP CONSTRAINT "FK_d8a1834cee7d6347016e3e55f04"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7fff02b7fb30cd3730d90693de"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8a1834cee7d6347016e3e55f0"`);
        await queryRunner.query(`DROP TABLE "groups_users"`);
        await queryRunner.query(`DROP TABLE "groups"`);
    }

}
