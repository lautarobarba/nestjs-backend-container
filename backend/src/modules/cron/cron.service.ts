import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Job, Queue } from 'bull';
import { ProfilePicture } from 'modules/user/profile-picture.entity';
import { UserService } from 'modules/user/user.service';

@Processor('cron')
@Injectable()
export class CronService {
  constructor(
		@InjectQueue('cron') 
		private readonly _cronQueue: Queue,
		private readonly _userService: UserService,
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

	// Ejecula la próxima tarea 'handleTestCron' de la cola
	@Process('handleTestCron')
	async handleTestCron(job: Job) {
		const { msg } = job.data;
    this.logger.debug('Ejecutando tarea enviada a la cola handleTestCron por testCron');
	}

	// Periodo: cada 24HS
	// Tarea: Eliminar imagenes de perfil de usuarios que no están en uso
  // Envía la tarea 'handleDeleteProfilePictures' a la cola
  @Cron('0 2 * * *')
	async deleteProfilePictures() {
    this.logger.debug('Se eliminarán las imágenes de perfil obsoletas');

		const job: Job = await this._cronQueue.add('handleDeleteProfilePictures');

		return {
			jobID: job.id
		};
	}

	// Ejecula la próxima tarea 'handleDeleteProfilePictures' de la cola
	@Process('handleDeleteProfilePictures')
	async handleDeleteProfilePictures(job: Job) {
    this.logger.debug('Eliminando imagenes de perfil obsoletas...');
		await this._userService.deleteUselessProfilePictures();
		this.logger.debug('Imagenes de perfil obsoletas eliminadas.');
	}
}
