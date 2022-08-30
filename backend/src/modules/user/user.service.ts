import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { EStatus, User } from './user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly _userRepository: Repository<User>
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const newUser: User = this._userRepository.create();

		newUser.email = createUserDto.email;
		newUser.name = createUserDto.name;
		newUser.password = createUserDto.password;

		newUser.status = EStatus.ACTIVE;
		newUser.isAdmin = false;
		newUser.created = new Date();
		newUser.updated = new Date();
		newUser.deleted = false;

		try {
			const savedUser: User = await this._userRepository.save(newUser);
			return savedUser;
		} catch (error) {
			// throw new ConflictException('Title already in use');
			console.log(error);
		}
	}

	async findAll(): Promise<User[]> {
		return this._userRepository.find();
	}

	async findOne(id: number): Promise<User> {
		return this._userRepository.findOne({
			where: { id },
		});
	}

	async findOneByEmail(email: string): Promise<User> {
		return this._userRepository.findOne({
			where: { email },
		});
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
		const user: User = await this._userRepository.findOne({
			where: { id },
		});
		if (updateUserDto.name) {
			user.name = updateUserDto.name;
		}
		if (updateUserDto.refreshToken) {
			user.refreshToken = updateUserDto.refreshToken;
		}
		if (updateUserDto.status) {
			user.status = updateUserDto.status;
		}
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
