import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as path from "path";

type DbEngine =
  | "mysql"
  | "mariadb"
  | "postgres"
  | "cockroachdb"
  | "sqlite"
  | "mssql"
  | "sap"
  | "oracle"
  | "cordova"
  | "nativescript"
  | "react-native"
  | "sqljs"
  | "mongodb"
  | "aurora-mysql"
  | "aurora-postgres"
  | "expo"
  | "better-sqlite3"
  | "capacitor"
  | "spanner";

function getDbEngine(): DbEngine {
  const raw = process.env.DB_ENGINE;
  if (!raw) {
    throw new Error(
      "DB_ENGINE no definido. Valores permitidos: mysql, postgresql",
    );
  }

  const normalized = raw.toLowerCase();
  if (normalized !== "mysql" && normalized !== "postgresql") {
    throw new Error(
      `DB_ENGINE invalido: "${raw}". Valores permitidos: mysql, postgresql`,
    );
  }

  return normalized as DbEngine;
}

function mapDbEngineToTypeOrm(engine: DbEngine): "mysql" | "postgres" {
  if (engine === "mysql") return "mysql";
  return "postgres";
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: mapDbEngineToTypeOrm(getDbEngine()),
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        entities: [path.join(__dirname, "/../**/*.entity{.ts,.js}")],
        migrations: [path.join(__dirname, "/migrations/*{.ts,.js}")],
        logging: process.env.DB_LOGGING === "true" ? true : false,
        synchronize: false,
        migrationsRun: false,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
