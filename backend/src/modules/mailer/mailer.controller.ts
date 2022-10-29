import { Controller, Get, Post, Body, Req, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { EmailTestDto } from './mailer.dto';
import { MailerService } from './mailer.service';

@ApiTags('Emails')
@Controller('mailer')
export class MailerController {
  constructor(private readonly _mailerService: MailerService) {}

  @Post('test-email')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ 
		status: HttpStatus.OK, 
	  description: 'Email sent',
	})
  async create(
    @Req() request: Request,
    @Body() emailTestDto: EmailTestDto
  ) {
    const ulrToImportCssInEmail: string = `${request.protocol}://host.docker.internal:${process.env.BACK_PORT}`;
    const ulrToImportImagesInEmail: string = `${request.protocol}://${request.get('Host')}`;
    // console.log(ulrToImportCssInEmail);
    // console.log(ulrToImportImagesInEmail);
    return this._mailerService.sendTest(
      ulrToImportCssInEmail, 
      ulrToImportImagesInEmail,
      emailTestDto.userEmail,
      emailTestDto.overwriteEmail
    );
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
    @Body() emailTestDto: EmailTestDto
  ) {
    const ulrToImportCssInEmail: string = `${request.protocol}://host.docker.internal:${process.env.BACK_PORT}`;
    const ulrToImportImagesInEmail: string = `${request.protocol}://${request.get('Host')}`;
    return this._mailerService.sendRegisterEmail(
      ulrToImportCssInEmail, 
      ulrToImportImagesInEmail, 
      emailTestDto.userEmail,
      emailTestDto.overwriteEmail
    );
  }
}
