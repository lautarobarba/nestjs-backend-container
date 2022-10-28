import { Controller, Get, Post, Body, Req, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { EmailDto, EmailTestDto } from './mailer.dto';
import { MailerService } from './mailer.service';

@ApiTags('Emails')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test')
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Req() request: Request,
    @Body() emailTestDto: EmailTestDto
  ) {
    const serverUrl: string = `${request.protocol}://${request.get('Host')}`;
    return this.mailerService.sendTest(serverUrl, emailTestDto.emailTo);
  }

  @Post('test-register-email')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ 
		status: HttpStatus.OK, 
	  description: 'Email sent',
	})
  @ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
  async sendRegisterEmail(
    @Req() request: Request,
    @Body() emailDto: EmailDto
  ) {
    const ulrToImportCss: string = `${request.protocol}://host.docker.internal:${process.env.BACK_PORT}`;
    const ulrToImportImages: string = `${request.protocol}://${request.get('Host')}`;
    console.log(ulrToImportCss);
    console.log(ulrToImportImages);
    return this.mailerService.sendRegisterEmail(ulrToImportCss, ulrToImportImages, emailDto);
  }
}
