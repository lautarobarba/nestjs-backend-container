import { drizzle } from "drizzle-orm/mysql2";
import Database from "mysql2";

export const DrizzleAsyncProvider = "drizzleProvider";

export const drizzleProvider = [
  {
    provider: DrizzleAsyncProvider,
    useFactory: async () => {
      // const mysql = new Database();
    },
  },
];

// import mysql from "mysql2/promise";
// const connection = await mysql.createConnection({
//   host: "host",
//   user: "user",
//   database: "database",
//   ...
// });
// const db = drizzle(connection);

// import { DataSource } from "typeorm";
// import * as path from "path";

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   database: process.env.DB_NAME,
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   entities: [path.join(__dirname, "/../**/*.entity{.ts,.js}")],
//   migrations: [path.join(__dirname, "/migrations/*{.ts,.js}")],
//   logging: (process.env.DB_LOGGING ?? false) as boolean,
//   synchronize: false,
//   migrationsRun: false,
// });
