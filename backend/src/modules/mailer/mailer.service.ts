import { Injectable, NotFoundException } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { MailerService as MailerServiceNode } from '@nestjs-modules/mailer';
import { EmailDto } from './mailer.dto';
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

	async sendTest(serverUrl: string, emailTo: string) {
		// return `This action send a test email to ${emailTo}`;

		await this._mailerServiceNode.sendMail({
			to: emailTo,
			// from: '"Support Team" <support@example.com>', // override default from
			subject: 'Título del email -.-',
			template: './test-template', // `.hbs` extension is appended automatically
			context: {
				// ✏️ filling curly brackets with content
				serverUrl: serverUrl,
				name: 'Lautaro :)',
			},
		});
	}

	// Envía la tarea a la cola
	async sendRegisterEmail(ulrToImportCss: string, ulrToImportImages: string, emailDto: EmailDto) {
		const { userId } = emailDto;
		const user: User = await this._userService.findOne(userId);

		if(!user) throw new NotFoundException('User does not exists');
		
		console.log(user.email);

		const job: Job = await this._emailSenderQueue.add('handleSendRegisterEmail', {
			ulrToImportCss: ulrToImportCss,
			ulrToImportImages: ulrToImportImages,
			user: user
		});

		// console.log(job);

		return {
			jobID: job.id
		};
		// await this._mailerServiceNode.sendMail({
		// 	to: user.email,
		// 	// from: '"Support Team" <support@example.com>', // override default from
		// 	subject: 'TITULO: Registro de prueba',
		// 	template: './register', // `.hbs` extension is appended automatically
		// 	context: {
		// 		ulrToImportCss: ulrToImportCss,
		// 		ulrToImportImages: ulrToImportImages,
		// 		user: user
		// 	},
		// });
	}

	// Ejecula la tarea de la cola
	@Process('handleSendRegisterEmail')
  async handleSendRegisterEmail(job: Job) {
		const { ulrToImportCss,  ulrToImportImages, user } = job.data;
		// console.log('--JOB DATA--');
		// console.log(ulrToImportCss);
		// console.log(ulrToImportImages);
		// console.log(user);
		console.log(`handleSendRegisterEmail: BEGIN Enviando correo a- ${user.email}`);
		try {
			await this._mailerServiceNode.sendMail({
				to: user.email,
				// from: '"Support Team" <support@example.com>', // override default from
				subject: 'TITULO: Registro de prueba',
				template: './register', // `.hbs` extension is appended automatically
				context: {
					ulrToImportCss: ulrToImportCss,
					ulrToImportImages: ulrToImportImages,
					user: user
				},
			});
			console.log(`handleSendRegisterEmail: END Enviando correo a- ${user.email}`);
		} catch (error){
			console.log(`handleSendRegisterEmail: ERROR Enviando correo a- ${user.email}`);
			console.log(error);
		}
  }
}
