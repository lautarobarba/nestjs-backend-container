import { ConflictException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { Status, User } from './user.entity';
import * as moment from 'moment';
import { validate } from 'class-validator';
import { Role } from 'modules/role/role.enum';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly _userRepository: Repository<User>
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const { email, name, password } = createUserDto;
		const timestamp: any = moment().format('YYYY-MM-DD HH:mm:ss');

		// Controlo que el nuevo usuario no exista
		const exists: User = await this._userRepository.findOne({
			where: { email },
		});

		// Si existe y no esta borrado lógico entonces hay conflictos
		if (exists && !exists.deleted)
			throw new ConflictException('Error: Keys already in use');

		// Si existe pero estaba borrado lógico entonces lo recupero
		if (exists && exists.deleted) {
			exists.name = name;
			exists.password = password;
			exists.deleted = false;
			exists.updatedAt = timestamp;

			// Controlo que el modelo no tenga errores antes de guardar
			const errors = await validate(exists);
			if (errors && errors.length > 0) throw new NotAcceptableException();

			return this._userRepository.save(exists);
		}

		// Si no existe entonces creo uno nuevo
		const user: User = await this._userRepository.create();
		user.email = email;
		user.name = email;
		user.password = password;
		user.status = Status.ACTIVE;
		user.role = Role.USER;
		user.updatedAt = timestamp;
		user.createdAt = timestamp;

		// Controlo que el modelo no tenga errores antes de guardar
		const errors = await validate(user);
		if (errors && errors.length > 0) throw new NotAcceptableException();

		return this._userRepository.save(user);
	}

	async findAll(): Promise<User[]> {
		return this._userRepository.find({
			where: { deleted: false },
			order: { id: 'ASC' },
		});
	}

	async findOne(id: number): Promise<User> {
		return this._userRepository.findOne({
			where: { id },
		});
	}

	async findOneById(id: number): Promise<User> {
		return this._userRepository.findOne({
			where: { id },
		});
	}

	async findOneByEmail(email: string): Promise<User> {
		return this._userRepository.findOne({
			where: { email },
		});
	}

	async update(updateUserDto: UpdateUserDto): Promise<User> {
		const { id, email, name, status, role } = updateUserDto;
		const timestamp: any = moment().format('YYYY-MM-DD HH:mm:ss');

		const user: User = await this._userRepository.findOne({
			where: { id },
		});

		if (!user) throw new NotFoundException();

		// Controlo que las claves no estén en uso
		if (email) {
			const exists: User = await this._userRepository.findOne({
				where: { email },
			});

			// Si existe y no esta borrado lógico entonces hay conflictos
			if (exists && !exists.deleted && exists.id !== id)
				throw new ConflictException('Error: Keys already in use');
		}

		// Si no hay problemas actualizo los atributos
		if (email) user.email = email;
		if (name) user.name = name;
		if (status) user.status = status;
		if (role) user.role = role;
		user.updatedAt = timestamp;

		// Controlo que el modelo no tenga errores antes de guardar
		const errors = await validate(user);
		if (errors && errors.length > 0) throw new NotAcceptableException();

		return this._userRepository.save(user);
	}

	async updateRefreshToken(id: number, refreshToken: string): Promise<User> {
		const timestamp: any = moment().format('YYYY-MM-DD HH:mm:ss');

		const user: User = await this._userRepository.findOne({
			where: { id },
		});

		if (!user) throw new NotFoundException();

		user.refreshToken = refreshToken;
		user.updatedAt = timestamp;

		// Controlo que el modelo no tenga errores antes de guardar
		const errors = await validate(user);
		if (errors && errors.length > 0) throw new NotAcceptableException();

		return this._userRepository.save(user);
	}

	async delete(id: number): Promise<void> {
		const user: User = await this._userRepository.findOne({
			where: { id },
		});
		user.deleted = true;
		this._userRepository.save(user);
	}

	async logout(id: number): Promise<void> {
		const user: User = await this._userRepository.findOne({
			where: { id },
		});
		user.refreshToken = null;
		this._userRepository.save(user);
	}
}
