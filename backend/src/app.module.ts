import { Module } from '@nestjs/common';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from 'database/database.module';
import { UserModule } from 'modules/user/user.module';
import { AuthModule } from 'modules/auth/auth.module';
import { NoteModule } from 'modules/note/note.module';
import { MailerModule } from './modules/mailer/mailer.module';

@Module({
	imports: [
		DatabaseModule,
		// Redis for queues
		BullModule.forRootAsync({
      useFactory: async () => ({
        redis: {
          host: 'redis',
          port: 6379,
        },
      }),
    }),
		AuthModule,
		UserModule, 
		NoteModule, 
		MailerModule
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
