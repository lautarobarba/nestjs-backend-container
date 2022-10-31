import { ConflictException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'modules/user/user.service';
import {Repository} from 'typeorm';
import { CreateNoteDto, UpdateNoteDto } from './note.dto';
import { Note } from './note.entity';
import * as moment from 'moment';
import { validate } from 'class-validator';

@Injectable()
export class NoteService {
	constructor(
		@InjectRepository(Note)
		private readonly _noteRepository: Repository<Note>,
		private readonly _userService: UserService
	) {}

	async create(createNoteDto: CreateNoteDto): Promise<Note> {
		const { title, content, userId } = createNoteDto;
		const timestamp: any = moment().format('YYYY-MM-DD HH:mm:ss');

		// Controlo que la nueva nota no exista
		const exists: Note = await this._noteRepository.findOne({
			where: { title },
		});

		// Si existe y no esta borrado lógico entonces hay conflictos
		if (exists && !exists.deleted)
			throw new ConflictException('Error: Keys already in use');

		// Si existe pero estaba borrado lógico entonces lo recupero
		if (exists && exists.deleted) {
			exists.content = content;
			exists.user = await this._userService.findOne(userId);
			exists.deleted = false;
			exists.updatedAt = timestamp;

			// Controlo que el modelo no tenga errores antes de guardar
			const errors = await validate(exists);
			if (errors && errors.length > 0) throw new NotAcceptableException();

			return this._noteRepository.save(exists);
		}

		// Si no existe entonces creo uno nuevo
		const note: Note = this._noteRepository.create();
		note.title = title;
		note.content = content;
		note.user = await this._userService.findOne(userId);
		note.updatedAt = timestamp;
		note.createdAt = timestamp;

		// Controlo que el modelo no tenga errores antes de guardar
		const errors = await validate(note);
		if (errors && errors.length > 0) throw new NotAcceptableException();

		return this._noteRepository.save(note);
	}

	async findAll(): Promise<Note[]> {
		return this._noteRepository.find({
			where: { deleted: false },
			order: { id: 'ASC' },
			relations: ['user'],
		});
	}

	async findOne(id: number): Promise<Note> {
		const note: Note = await this._noteRepository.findOne({
			where: { id },
			relations: ['user'],
		});

		if (!note) throw new NotFoundException();
		return note;
	}

	async update(updateNoteDto: UpdateNoteDto): Promise<Note> {
		const { id, title, content, userId } = updateNoteDto;
		const timestamp: any = moment().format('YYYY-MM-DD HH:mm:ss');

		const note: Note = await this._noteRepository.findOne({
			where: { id },
		});

		if (!note) throw new NotFoundException();

		// Controlo que las claves no estén en uso
		if (title) {
			const exists: Note = await this._noteRepository.findOne({
				where: { title },
			});

			// Si existe y no esta borrado lógico entonces hay conflictos
			if (exists && !exists.deleted && exists.id !== id)
				throw new ConflictException('Error: Keys already in use');
		}

		// Si no hay problemas actualizo los atributos
		if (title) note.title = title;
		if (content) note.content = content;
		if (userId) note.user = await this._userService.findOne(userId);
		note.updatedAt = timestamp;

		// Controlo que el modelo no tenga errores antes de guardar
		const errors = await validate(note);
		if (errors && errors.length > 0) throw new NotAcceptableException();

		return this._noteRepository.save(note);
	}

	async delete(id: number): Promise<void> {
		const timestamp: any = moment().format('YYYY-MM-DD HH:mm:ss');

		const note: Note = await this._noteRepository.findOne({
			where: { id },
		});

		if (!note) throw new NotFoundException();

		note.deleted = true;
		note.updatedAt = timestamp;

		// Controlo que el modelo no tenga errores antes de guardar
		const errors = await validate(note);
		if (errors && errors.length > 0) throw new NotAcceptableException();

		this._noteRepository.save(note);
	}
}
