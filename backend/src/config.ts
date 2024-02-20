import "dotenv/config";

export const ENV_VAR: {
  // APP
  BACK_PORT: number;
  //   EXTERNAL_LINK: string;
  //   INTERNAL_LINK: string;
  // REDIS
  REDIS_HOST: string;
  REDIS_PORT: number;
  //   // DB
  //   DB_ENGINE: "postgres" | "mysql";
  //   DB_HOST: string;
  //   DB_PORT: number;
  //   DB_NAME: string;
  //   DB_USER: string;
  //   DB_PASSWORD: string;
  //   DB_LOGGING: boolean;
  //   // JWT Token
  //   JWT_SECRET: string;
  //   JWT_EXPIRATION_TIME: string;
  //   // Servicio de correos
  //   SMTP_HOST: string;
  //   SMTP_PORT: number;
  //   SMTP_SECURE: boolean;
  //   SMTP_USER: string;
  //   SMTP_PASSWORD: string;
  //   // FRONTEND ROUTES
  //   EMAIL_CONFIRMATION_URL: string;
  //   PASSWORD_RECOVERY_URL: string;
  //   // Media
  //   UPLOAD_FILE_DETINATION: string;
} = {
  // APP
  BACK_PORT: Number(process.env.BACK_PORT ?? 3000),
  //   EXTERNAL_LINK: process.env.EXTERNAL_LINK ?? "http://localhost:7000",
  //   INTERNAL_LINK: process.env.INTERNAL_LINK ?? "http://localhost:7000",
  // REDIS
  REDIS_HOST: process.env.REDIS_HOST ?? "redis",
  REDIS_PORT: Number(process.env.REDIS_PORT ?? 6379),
  //   // DB
  //   DB_ENGINE:
  //     process.env.DB_ENGINE == "postgres" || process.env.DB_ENGINE == "mysql"
  //       ? process.env.DB_ENGINE
  //       : "postgres",
  //   DB_HOST: process.env.DB_HOST ?? "localhost",
  //   DB_PORT: Number(process.env.DB_PORT ?? 5432),
  //   DB_NAME: process.env.DB_NAME ?? "postgres",
  //   DB_USER: process.env.DB_USER ?? "postgres",
  //   DB_PASSWORD: process.env.DB_PASSWORD,
  //   DB_LOGGING: (process.env.DB_LOGGING ?? "").toLowerCase() === "true",
  //   // JWT Token
  //   JWT_SECRET: process.env.JWT_SECRET ?? "secret",
  //   JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME ?? "1d",
  //   // Servicio de correos
  //   SMTP_HOST: process.env.SMTP_HOST ?? "smtp.host.com",
  //   SMTP_PORT: Number(process.env.SMTP_PORT ?? 25),
  //   SMTP_SECURE: (process.env.SMTP_SECURE ?? "").toLowerCase() === "true",
  //   SMTP_USER: process.env.SMTP_USER ?? "smpt_user",
  //   SMTP_PASSWORD: process.env.SMTP_PASSWORD ?? "smpt_password",
  //   // FRONTEND ROUTES
  //   EMAIL_CONFIRMATION_URL:
  //     process.env.EMAIL_CONFIRMATION_URL ?? "https://my-app.com/confirm-email",
  //   PASSWORD_RECOVERY_URL:
  //     process.env.PASSWORD_RECOVERY_URL ?? "https://my-app.com/change-password",
  //   // Media
  //   UPLOAD_FILE_DETINATION: process.env.UPLOAD_FILE_DETINATION ?? "./uploads",
};
