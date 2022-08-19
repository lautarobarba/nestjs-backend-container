import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'modules/user/user.service';
import { CreateNoteDto, UpdateNoteDto } from './note.dto';
import { Note } from './note.entity';
import { NoteRepository } from './note.repository';

@Injectable()
export class NoteService {
	constructor(
		@InjectRepository(NoteRepository)
		private readonly _noteRepository: NoteRepository,
		private readonly _userService: UserService
	) {}

	async create(createNoteDto: CreateNoteDto): Promise<Note> {
		const newNote: Note = this._noteRepository.create();
		newNote.title = createNoteDto.title;
		newNote.content = createNoteDto.content;
		newNote.author = await this._userService.findOne(createNoteDto.author);
		try {
			const savedNote: Note = await this._noteRepository.save(newNote);
			return savedNote;
		} catch (error) {
			throw new ConflictException('Title already in use');
		}
	}

	async findAll(): Promise<Note[]> {
		return this._noteRepository.find();
	}

	async findOne(id: number): Promise<Note> {
		return this._noteRepository.findOne({
			where: { id },
		});
	}

	async update(id: number, updateNoteDto: UpdateNoteDto): Promise<Note> {
		const note: Note = await this._noteRepository.findOne({
			where: { id },
		});
		if (updateNoteDto.title) {
			note.title = updateNoteDto.title;
		}
		if (updateNoteDto.content) {
			note.content = updateNoteDto.content;
		}
		return this._noteRepository.save(note);
	}

	async delete(id: number): Promise<void> {
		const note: Note = await this._noteRepository.findOne({
			where: { id },
		});
		note.deleted = true;
		this._noteRepository.save(note);
	}
}
