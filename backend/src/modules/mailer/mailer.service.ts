import { Injectable } from '@nestjs/common';
import { MailerService as MailerServiceNode } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
	constructor(private mailerServiceNode: MailerServiceNode) {}

	async sendTest(serverUrl: string, emailTo: string) {
		// return `This action send a test email to ${emailTo}`;

		await this.mailerServiceNode.sendMail({
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
}
