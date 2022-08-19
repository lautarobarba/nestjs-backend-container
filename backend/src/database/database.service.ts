import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { ConnectionOptions } from 'typeorm';

export const databaseProviders = [
	TypeOrmModule.forRootAsync({
		async useFactory() {
			return {
				type: process.env.DB_CONNECTION,
				host: process.env.DB_HOST,
				port: Number(process.env.DB_PORT),
				database: process.env.DB_NAME,
				username: process.env.DB_USER,
				password: process.env.DB_PASSWORD,
				entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
				migrations: [path.join(__dirname, '/migrations/*{.ts,.js}')],
				synchronize: false,
			} as ConnectionOptions;
		},
	}),
];
