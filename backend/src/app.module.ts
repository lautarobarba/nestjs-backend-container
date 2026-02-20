import { Module } from '@nestjs/common';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from 'database/database.module';
import { UserModule } from 'modules/user/user.module';
import { AuthModule } from 'modules/auth/auth.module';
import { NoteModule } from 'modules/note/note.module';
import { RoleModule } from './modules/role/role.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from 'modules/cron/cron.module';
import { BookModule } from 'modules/book/book.module';


@Module({
	imports: [
		// PostgreSQL connection
		DatabaseModule,
		// Redis connection for queues
		BullModule.forRootAsync({
			useFactory: async () => ({
				redis: {
					host: 'redis',
					port: 6379,
				},
			}),
		}),
		// Cron Jobs
		ScheduleModule.forRoot(),
		// Auth
		AuthModule,
		UserModule,
		RoleModule,
		// Utils
		MailerModule,
		CronModule,
		// App modules 
		BookModule,
		NoteModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {
	static port: number | string;

	constructor() {
		AppModule.port = process.env.APP_PORT || 3000;
	}
}
