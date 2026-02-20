import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'modules/book/book.entity';
import { UserModule } from 'modules/user/user.module';
import { NoteController } from './note.controller';
import { Note } from './note.entity';
import { NoteService } from './note.service';

@Module({
	imports: [TypeOrmModule.forFeature([Note, Book]), UserModule],
	controllers: [NoteController],
	providers: [NoteService],
})
export class NoteModule {}
