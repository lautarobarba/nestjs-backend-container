import { Controller, Get, Post, Body, Req, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { EmailTestDto } from './mailer.dto';
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
}
