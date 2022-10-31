import { ConflictException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { Status, User } from './user.entity';
import * as moment from 'moment';
import * as mv from 'mv';
import { validate } from 'class-validator';
import { Role } from '../auth/role.enum';
import { IJWTPayload } from 'modules/auth/jwt-payload.interface';
import { ProfilePicture } from './profile-picture.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly _userRepository: Repository<User>,
		@InjectRepository(ProfilePicture)
		private readonly _profilePictureRepository: Repository<ProfilePicture>
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const { email, firstname, lastname, password } = createUserDto;
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
			exists.firstname = firstname;
			exists.lastname = lastname;
			exists.password = password;
			exists.deleted = false;
			exists.updatedAt = timestamp;

			// Actualizo foto de perfil
			// Primero reviso si existía una foto de perfil previa y la marco como eliminada.
			if(createUserDto.profilePicture){
				// Si recibí una nueva foto de perfil
				// 1° Elimino la vieja
				if(exists.profilePicture){
					const oldProfilePicture = await this._profilePictureRepository.findOne({
						where: { id: exists.profilePicture.id },
					});
					oldProfilePicture.deleted = true;
					oldProfilePicture.updatedAt = timestamp;
					await this._profilePictureRepository.save(oldProfilePicture);
				}
				
				// 2° Voy a mover la imagen desde la carpeta temporal donde la recibí
				const imgSource = createUserDto.profilePicture.path;
				const imgDestination = imgSource.replace('temp', 'profile-pictures');
				mv(imgSource, imgDestination, {mkdirp: true}, (err: Error) => {
					console.log(err);
				});

				// 3° La guardo en la DB
				const newProfilePicture: ProfilePicture = this._profilePictureRepository.create();
				newProfilePicture.fileName = createUserDto.profilePicture.filename;
				newProfilePicture.path = imgDestination;
				newProfilePicture.mimetype = createUserDto.profilePicture.mimetype;
				newProfilePicture.originalName = createUserDto.profilePicture.originalname;
				
				// 4° Asigno la nueva al usuario
				exists.profilePicture = await this._profilePictureRepository.save(newProfilePicture);
			}

			// Controlo que el modelo no tenga errores antes de guardar
			const errors = await validate(exists);
			if (errors && errors.length > 0) throw new NotAcceptableException();

			return this._userRepository.save(exists);
		}

		// Si no existe entonces creo uno nuevo
		const user: User = this._userRepository.create();
		user.email = email;
		user.isEmailConfirmed = false;
		user.firstname = firstname;
		user.lastname = lastname;
		user.password = password;
		user.status = Status.ACTIVE;
		user.role = Role.USER;
		user.updatedAt = timestamp;
		user.createdAt = timestamp;

		// Guardo la foto de perfil
		if(createUserDto.profilePicture){

			// 1° Voy a mover la imagen desde la carpeta temporal donde la recibí
			const imgSource = createUserDto.profilePicture.path;
			const imgDestination = imgSource.replace('temp', 'profile-pictures');
			mv(imgSource, imgDestination, {mkdirp: true}, (err: Error) => {
				console.log(err);
			});

			// 2° La guardo en la DB
			const newProfilePicture: ProfilePicture = this._profilePictureRepository.create();
			newProfilePicture.fileName = createUserDto.profilePicture.filename;
			newProfilePicture.path = imgDestination;
			newProfilePicture.mimetype = createUserDto.profilePicture.mimetype;
			newProfilePicture.originalName = createUserDto.profilePicture.originalname;
			
			// 3° Asigno la nueva al usuario
			user.profilePicture = await this._profilePictureRepository.save(newProfilePicture);
		}

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
			relations: ['profilePicture']
		});
	}

	async findOneById(id: number): Promise<User> {
		const user: User = await this._userRepository.findOne({
			where: { id },
		});

		if (!user) throw new NotFoundException('Error: Not Found');

		return user;
	}

	async findOneByEmail(email: string): Promise<User> {
		const user: User = await this._userRepository.findOne({
			where: { email },
		});

		if (!user) throw new NotFoundException('Error: Not Found');

		return user;
	}

	async update(updateUserDto: UpdateUserDto): Promise<User> {
		const { id, email, isEmailConfirmed, firstname, lastname, status, role } = updateUserDto;
		const timestamp: any = moment().format('YYYY-MM-DD HH:mm:ss');

		const user: User = await this._userRepository.findOne({
			where: { id },
			relations: ['profilePicture']
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
		if (isEmailConfirmed) user.isEmailConfirmed = isEmailConfirmed;
		if (firstname) user.firstname = firstname;
		if (lastname) user.lastname = lastname;
		if (status) user.status = status;
		if (role) user.role = role;
		user.updatedAt = timestamp;

		// Actualizo foto de perfil
		// Primero reviso si existía una foto de perfil previa y la marco como eliminada.
		if(updateUserDto.profilePicture){
			// Si recibí una nueva foto de perfil
			// 1° Elimino la vieja
			if(user.profilePicture){
				const oldProfilePicture = await this._profilePictureRepository.findOne({
					where: { id: user.profilePicture.id },
				});
				oldProfilePicture.deleted = true;
				oldProfilePicture.updatedAt = timestamp;
				await this._profilePictureRepository.save(oldProfilePicture);
			}
			
			// 2° Voy a mover la imagen desde la carpeta temporal donde la recibí
			const imgSource = updateUserDto.profilePicture.path;
			const imgDestination = imgSource.replace('temp', 'profile-pictures');
			mv(imgSource, imgDestination, {mkdirp: true}, (err: Error) => {
				console.log(err);
			});

			// 3° La guardo en la DB
			const newProfilePicture: ProfilePicture = this._profilePictureRepository.create();
			newProfilePicture.fileName = updateUserDto.profilePicture.filename;
			newProfilePicture.path = imgDestination;
			newProfilePicture.mimetype = updateUserDto.profilePicture.mimetype;
			newProfilePicture.originalName = updateUserDto.profilePicture.originalname;
			
			// 4° Asigno la nueva al usuario
			user.profilePicture = await this._profilePictureRepository.save(newProfilePicture);
		}
		
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
		const timestamp: any = moment().format('YYYY-MM-DD HH:mm:ss');
		const user: User = await this._userRepository.findOne({
			where: { id },
		});
		user.deleted = true;
		user.updatedAt = timestamp;
		this._userRepository.save(user);
	}

	async logout(id: number): Promise<void> {
		const user: User = await this._userRepository.findOne({
			where: { id },
		});
		user.refreshToken = null;
		this._userRepository.save(user);
	}

	async getUserFromRequest(request: Request): Promise<User>{
		const session: IJWTPayload = request.user as IJWTPayload;
		const user: User = await this._userRepository.findOne({
			where: { id: session.sub },
		});

		if (!user) throw new NotFoundException('Error: Not Found');

		return user;
	}

	async getProfilePicture(id: number): Promise<ProfilePicture>{
		const profilePicture: ProfilePicture = await this._profilePictureRepository.findOne({
			where: { id },
		});

		if (!profilePicture) throw new NotFoundException('Error: Not Found');

		return profilePicture;
	}
}
