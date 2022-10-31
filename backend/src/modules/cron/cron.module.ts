import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CronService } from './cron.service';

@Module({
	imports: [
		// Redis connection for queues
		BullModule.registerQueue({
				name: 'cron',
		}),
		// UserModule,
	],
	providers: [CronService],
	exports: [CronService],
})
export class CronModule {}
