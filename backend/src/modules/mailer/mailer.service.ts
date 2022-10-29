import { Injectable, NotFoundException } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { MailerService as MailerServiceNode } from '@nestjs-modules/mailer';
import { UserService } from 'modules/user/user.service';
import { User } from 'modules/user/user.entity';

@Processor('emailSender')
@Injectable()
export class MailerService {
	constructor(
		@InjectQueue('emailSender') 
		private readonly _emailSenderQueue: Queue,
		private readonly _mailerServiceNode: MailerServiceNode,
		private readonly _userService: UserService
		) {}

	// Envía la tarea 'handleSendTestEmail' a la cola
	async sendTest(
		ulrToImportCssInEmail: string, 
		ulrToImportImagesInEmail: string,
		userEmail: string,
		overwriteEmail?: string
		) {
		console.log(`Se enviará un correo de prueba a ${userEmail}`);

		const job: Job = await this._emailSenderQueue.add('handleSendTestEmail', {
			ulrToImportCssInEmail: ulrToImportCssInEmail,
			ulrToImportImagesInEmail: ulrToImportImagesInEmail,
			mailbox: overwriteEmail ?? userEmail,
		});

		// console.log(job);
		return {
			jobID: job.id
		};
	}

	// Ejecula la próxima tarea 'handleSendTestEmail' de la cola
	@Process('handleSendTestEmail')
	async handleSendTestEmail(job: Job) {
		const { ulrToImportCssInEmail,  ulrToImportImagesInEmail, mailbox } = job.data;
		console.log(`handleSendTestEmail: BEGIN Enviando correo a- ${mailbox}`);
		try {
			await this._mailerServiceNode.sendMail({
				to: mailbox,
				// from: '"Support Team" <support@example.com>', // override default from
				subject: 'TITULO: Correo de prueba',
				template: './test', // `.hbs` extension is appended automatically
				context: {
					ulrToImportCssInEmail: ulrToImportCssInEmail,
					ulrToImportImagesInEmail: ulrToImportImagesInEmail,
					mailbox: mailbox
				},
			});
			console.log(`handleSendTestEmail: END Enviando correo a- ${mailbox}`);
		} catch (error){
			console.log(`handleSendTestEmail: ERROR Enviando correo a- ${mailbox}`);
			console.log(error);
		}
	}

	// Envía la tarea 'handleSendRegisterEmail' a la cola
	async sendRegisterEmail(
		ulrToImportCssInEmail: string, 
		ulrToImportImagesInEmail: string, 
		userEmail: string, 
		overwriteEmail?: string
		) {
		const user: User = await this._userService.findOneByEmail(userEmail);

		if(!user) throw new NotFoundException('User does not exists');
		
		// console.log(user.email);

		const job: Job = await this._emailSenderQueue.add('handleSendRegisterEmail', {
			ulrToImportCssInEmail: ulrToImportCssInEmail,
			ulrToImportImagesInEmail: ulrToImportImagesInEmail,
			user: user,
			mailbox: overwriteEmail ?? userEmail,
		});

		// console.log(job);
		return {
			jobID: job.id
		};
	}

	// Ejecula la próxima tarea 'handleSendRegisterEmail' de la cola
	@Process('handleSendRegisterEmail')
  async handleSendRegisterEmail(job: Job) {
		const { ulrToImportCssInEmail,  ulrToImportImagesInEmail, user, mailbox } = job.data;
		console.log(`handleSendRegisterEmail: BEGIN Enviando correo a- ${mailbox}`);
		try {
			await this._mailerServiceNode.sendMail({
				to: mailbox,
				// from: '"Support Team" <support@example.com>', // override default from
				subject: 'TITULO: Registro de prueba',
				template: './register', // `.hbs` extension is appended automatically
				context: {
					ulrToImportCssInEmail: ulrToImportCssInEmail,
					ulrToImportImagesInEmail: ulrToImportImagesInEmail,
					user: user
				},
			});
			console.log(`handleSendRegisterEmail: END Enviando correo a- ${mailbox}`);
		} catch (error){
			console.log(`handleSendRegisterEmail: ERROR Enviando correo a- ${mailbox}`);
			console.log(error);
		}
  }
}
