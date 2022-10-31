import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Job, Queue } from 'bull';

@Processor('cron')
@Injectable()
export class CronService {
  constructor(
		@InjectQueue('cron') 
		private readonly _cronQueue: Queue,
    ) {}
  private readonly logger = new Logger(CronService.name)

  // @Cron('*/5 * * * * *')
  handleCron() {
    this.logger.debug('Cron');
		console.log('asdasd');
  }

  // Envía la tarea 'handleTestCron' a la cola
  // @Cron('*/5 * * * * *')
	async testCron() {
    this.logger.debug('¡Cron está funcionando!');

		const job: Job = await this._cronQueue.add('handleTestCron', {
      // Por si necesito enviar datos
      msg: 'TestCron123'
    });

		return {
			jobID: job.id
		};
	}

	// Ejecula la próxima tarea 'handleCron' de la cola
	@Process('handleTestCron')
	async handleTestCron(job: Job) {
		const { msg } = job.data;
    this.logger.debug('Ejecutando tarea enviada a la cola handleCron por testCron.');
	}
}
