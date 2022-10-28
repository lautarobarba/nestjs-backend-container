import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { MailerService as MailerServiceNode } from '@nestjs-modules/mailer';
import { EmailDto } from './mailer.dto';
import { UserService } from 'modules/user/user.service';
import { User } from 'modules/user/user.entity';

@Injectable()
export class MailerService {
	constructor(
		@InjectQueue('emailSender') 
		private _emailSenderQueue: Queue,
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

	async sendRegisterEmail(ulrToImportCss: string, ulrToImportImages: string, emailDto: EmailDto) {
		const { userId } = emailDto;
		const user: User = await this._userService.findOne(userId);

		if(!user) throw new NotFoundException('User does not exists');
		
		console.log(user.email);
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
	}
}
