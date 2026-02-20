import { DataSource } from "typeorm";
import * as path from "path";

type DbEngine = "mysql" | "postgresql";

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

export const AppDataSource = new DataSource({
  type: mapDbEngineToTypeOrm(getDbEngine()),
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entities: [path.join(__dirname, "/../**/*.entity{.ts,.js}")],
  migrations: [path.join(__dirname, "/migrations/*{.ts,.js}")],
  logging: (process.env.DB_LOGGING ?? false) as boolean,
  synchronize: false,
  migrationsRun: false,
});
