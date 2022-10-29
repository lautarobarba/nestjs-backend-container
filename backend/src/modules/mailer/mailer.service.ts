import { Injectable, NotFoundException } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { MailerService as MailerServiceNode } from '@nestjs-modules/mailer';
import { UserService } from 'modules/user/user.service';
import { User } from 'modules/user/user.entity';
import { AuthService } from 'modules/auth/auth.service';
import { SessionDto } from 'modules/auth/auth.dto';

@Processor('emailSender')
@Injectable()
export class MailerService {
	constructor(
		@InjectQueue('emailSender') 
		private readonly _emailSenderQueue: Queue,
		private readonly _mailerServiceNode: MailerServiceNode,
		private readonly _userService: UserService,
		) {}

	// Envía la tarea 'handleSendTestEmail' a la cola
	async sendTestEmail(
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

	// Envía la tarea 'handleSendRegistrationEmail' a la cola
	async sendRegistrationEmail(
		ulrToImportCssInEmail: string, 
		ulrToImportImagesInEmail: string, 
		userEmail: string, 
		overwriteEmail?: string
		) {
		const user: User = await this._userService.findOneByEmail(userEmail);

		if(!user) throw new NotFoundException('User does not exists');
		
		// console.log(user.email);

		const job: Job = await this._emailSenderQueue.add('handleSendRegistrationEmail', {
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

	// Ejecula la próxima tarea 'handleSendRegistrationEmail' de la cola
	@Process('handleSendRegistrationEmail')
  async handleSendRegistrationEmail(job: Job) {
		const { ulrToImportCssInEmail,  ulrToImportImagesInEmail, user, mailbox } = job.data;
		console.log(`handleSendRegistrationEmail: BEGIN Enviando correo a- ${mailbox}`);
		try {
			await this._mailerServiceNode.sendMail({
				to: mailbox,
				// from: '"Support Team" <support@example.com>', // override default from
				subject: 'TITULO: Registro',
				template: './registration', // `.hbs` extension is appended automatically
				context: {
					ulrToImportCssInEmail: ulrToImportCssInEmail,
					ulrToImportImagesInEmail: ulrToImportImagesInEmail,
					user: user
				},
			});
			console.log(`handleSendRegistrationEmail: END Enviando correo a- ${mailbox}`);
		} catch (error){
			console.log(`handleSendRegistrationEmail: ERROR Enviando correo a- ${mailbox}`);
			console.log(error);
		}
  }

	// Envía la tarea 'handleSendEmailConfirmationEmail' a la cola
	async sendEmailConfirmationEmail(
		ulrToImportCssInEmail: string, 
		ulrToImportImagesInEmail: string, 
		userEmail: string,
		accessToken: string,
		overwriteEmail?: string
		) {
		const user: User = await this._userService.findOneByEmail(userEmail);

		if(!user) throw new NotFoundException('User does not exists');
		
		// console.log(user.email);

		const job: Job = await this._emailSenderQueue.add('handleSendEmailConfirmationEmail', {
			ulrToImportCssInEmail: ulrToImportCssInEmail,
			ulrToImportImagesInEmail: ulrToImportImagesInEmail,
			user: user,
			accessToken,
			mailbox: overwriteEmail ?? userEmail,
		});

		// console.log(job);
		return {
			jobID: job.id
		};
	}

	// Ejecula la próxima tarea 'handleSendEmailConfirmationEmail' de la cola
	@Process('handleSendEmailConfirmationEmail')
	async handleSendEmailConfirmationEmail(job: Job) {
		const { ulrToImportCssInEmail,  ulrToImportImagesInEmail, user, accessToken, mailbox } = job.data;
		console.log(`handleSendEmailConfirmationEmail: BEGIN Enviando correo a- ${mailbox}`);

		// Ruta para confirmar el correo electrónico en el frontend
		const emailConfirmationUrl: string = `${process.env.EMAIL_CONFIRMATION_URL}/${accessToken}`;

		try {
			await this._mailerServiceNode.sendMail({
				to: mailbox,
				// from: '"Support Team" <support@example.com>', // override default from
				subject: 'TITULO: Confirmación de correo electrónico',
				template: './email-confirmation', // `.hbs` extension is appended automatically
				context: {
					ulrToImportCssInEmail: ulrToImportCssInEmail,
					ulrToImportImagesInEmail: ulrToImportImagesInEmail,
					user: user,
					emailConfirmationUrl
				},
			});
			console.log(`handleSendEmailConfirmationEmail: END Enviando correo a- ${mailbox}`);
		} catch (error){
			console.log(`handleSendEmailConfirmationEmail: ERROR Enviando correo a- ${mailbox}`);
			console.log(error);
		}
	}

	// Envía la tarea 'handleSendEmailConfirmedEmail' a la cola
	async sendEmailConfirmedEmail(
		ulrToImportCssInEmail: string, 
		ulrToImportImagesInEmail: string, 
		userEmail: string,
		overwriteEmail?: string
		) {
		const user: User = await this._userService.findOneByEmail(userEmail);

		if(!user) throw new NotFoundException('User does not exists');
		
		// console.log(user.email);

		const job: Job = await this._emailSenderQueue.add('handleSendEmailConfirmedEmail', {
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

	// Ejecula la próxima tarea 'handleSendEmailConfirmedEmail' de la cola
	@Process('handleSendEmailConfirmedEmail')
	async handleSendEmailConfirmedEmail(job: Job) {
		const { ulrToImportCssInEmail,  ulrToImportImagesInEmail, user, accessToken, mailbox } = job.data;
		console.log(`handleSendEmailConfirmedEmail: BEGIN Enviando correo a- ${mailbox}`);

		try {
			await this._mailerServiceNode.sendMail({
				to: mailbox,
				// from: '"Support Team" <support@example.com>', // override default from
				subject: 'TITULO: Confirmación de correo electrónico ACCEPTADA',
				template: './email-confirmed', // `.hbs` extension is appended automatically
				context: {
					ulrToImportCssInEmail: ulrToImportCssInEmail,
					ulrToImportImagesInEmail: ulrToImportImagesInEmail,
					user: user,
				},
			});
			console.log(`handleSendEmailConfirmedEmail: END Enviando correo a- ${mailbox}`);
		} catch (error){
			console.log(`handleSendEmailConfirmedEmail: ERROR Enviando correo a- ${mailbox}`);
			console.log(error);
		}
	}
}
