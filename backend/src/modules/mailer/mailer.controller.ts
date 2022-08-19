import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailTestDto } from './mailer.dto';
import { MailerService } from './mailer.service';

@ApiTags('Emails')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() emailTestDto: EmailTestDto) {
    console.log(emailTestDto.emailTo);
    return this.mailerService.sendTest(emailTestDto.emailTo);
  }
}
