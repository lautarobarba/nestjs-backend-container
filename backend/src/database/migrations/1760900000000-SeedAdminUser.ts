import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcryptjs";

export class SeedAdminUser1760900000000 implements MigrationInterface {
  name = "SeedAdminUser1760900000000";

  private isPostgres(queryRunner: QueryRunner): boolean {
    return queryRunner.connection.options.type === "postgres";
  }

  private isMysql(queryRunner: QueryRunner): boolean {
    return queryRunner.connection.options.type === "mysql";
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminEmail = "admin@admin.com";
    const adminRoleName = "Administrador";
    // Hashear la contraseña por defecto 'admin' en tiempo de ejecución
    const adminPassword = await bcrypt.hash("admin", 10);

    if (this.isPostgres(queryRunner)) {
      await queryRunner.query(`
        WITH admin_role AS (
          INSERT INTO "roles" ("name") 
          VALUES ('${adminRoleName}') 
          ON CONFLICT ("name") DO UPDATE SET "name" = EXCLUDED."name" 
          RETURNING "id"
        ), 
        inserted_user AS (
          INSERT INTO "users" ("email", "firstname", "lastname", "password", "status") 
          VALUES ('${adminEmail}', 'admin', 'admin', '${adminPassword}', 'ACTIVE') 
          ON CONFLICT ("email") DO UPDATE SET "deleted" = false 
          RETURNING "id"
        ) 
        INSERT INTO "users_roles" ("user_id", "role_id") 
        SELECT inserted_user."id", admin_role."id" 
        FROM inserted_user CROSS JOIN admin_role 
        ON CONFLICT ("user_id", "role_id") DO NOTHING;
      `);
      return;
    }

    if (this.isMysql(queryRunner)) {
      // 1. Insertar Rol
      await queryRunner.query(
        `INSERT IGNORE INTO roles (name) VALUES ('${adminRoleName}')`,
      );
      // 2. Insertar Usuario
      await queryRunner.query(`
        INSERT IGNORE INTO users (email, firstname, lastname, password, status) 
        VALUES ('${adminEmail}', 'admin', 'admin', '${adminPassword}', 'ACTIVE')
      `);
      // 3. Vincular Usuario y Rol
      await queryRunner.query(`
        INSERT IGNORE INTO users_roles (user_id, role_id)
        SELECT u.id, r.id 
        FROM users u, roles r 
        WHERE u.email = '${adminEmail}' AND r.name = '${adminRoleName}'
      `);
      return;
    }

    throw new Error(
      `Unsupported DB engine for migration SeedAdminUser1760900000000: ${queryRunner.connection.options.type}`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const adminEmail = "admin@admin.com";
    const adminRoleName = "Administrador";

    if (this.isPostgres(queryRunner)) {
      await queryRunner.query(`
        DELETE FROM "users_roles" 
        WHERE "user_id" IN (SELECT "id" FROM "users" WHERE "email" = '${adminEmail}')
        AND "role_id" IN (SELECT "id" FROM "roles" WHERE "name" = '${adminRoleName}')
      `);
      await queryRunner.query(
        `DELETE FROM "users" WHERE "email" = '${adminEmail}'`,
      );
      return;
    }

    if (this.isMysql(queryRunner)) {
      await queryRunner.query(`
        DELETE ur FROM users_roles ur
        JOIN users u ON u.id = ur.user_id
        JOIN roles r ON r.id = ur.role_id
        WHERE u.email = '${adminEmail}' AND r.name = '${adminRoleName}'
      `);
      await queryRunner.query(
        `DELETE FROM users WHERE email = '${adminEmail}'`,
      );
      return;
    }

    throw new Error(
      `Unsupported DB engine for migration SeedAdminUser1760900000000: ${queryRunner.connection.options.type}`,
    );
  }
}
