import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'modules/user/user.dto';
import { UserService } from 'modules/user/user.service';
import { User } from '../user/user.entity';
import { LoginDto, SessionDto } from './auth.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly _userService: UserService,
		private readonly _jwtService: JwtService
	) {}

	async register(createUserDto: CreateUserDto): Promise<SessionDto> {
		const { email } = createUserDto;

		// Verifico que el nombre de usuario no esté en uso
		const userExists = await this._userService.findOneByEmail(email);
		if (userExists) {
			throw new ConflictException('Email already in use');
		}

		// Hash password
		const salt = await genSalt(10);
		const hashedPassword: string = await hash(createUserDto.password, salt);

		// Creo el usuario
		const user: User = await this._userService.create({
			...createUserDto,
			password: hashedPassword,
		});

		const tokens: SessionDto = await this.getTokens(user.id, email);
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	async login(loginDto: LoginDto): Promise<SessionDto> {
		const { email, password } = loginDto;
		const user: User = await this._userService.findOneByEmail(email);

		if (!user) {
			throw new NotFoundException('User does not exists');
		}

		const passwordMatches = await compare(password, user.password);

		if (!passwordMatches) {
			throw new UnauthorizedException('Invalid password');
		}

		const tokens: SessionDto = await this.getTokens(user.id, user.email);
		return tokens;
	}

	async refreshTokens(id: number, refreshToken: string) {
		const user = await this._userService.findOne(id);

		if (!user || !user.refreshToken) {
			throw new ForbiddenException('Access Denied');
		}

		const tokenMatches = await compare(refreshToken, user.refreshToken);

		if (!tokenMatches) {
			throw new ForbiddenException('Access Denied');
		}

		const tokens: SessionDto = await this.getTokens(user.id, user.email);
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	async logout(id: number) {
		return this._userService.logout(id);
	}

	async getPrivate(id: number): Promise<string> {
		const user: User = await this._userService.findOne(id);
		return `Este sitio sólo se puede ver si el usuario esta autenticado.\nUSER_ID: ${user.id}\nNAME: ${user.name}\nEMAIL: ${user.email}`;
	}

	async updateRefreshToken(id: number, refreshToken: string) {
		// Hash token
		const salt = await genSalt(10);
		const hashedRefreshToken: string = await hash(refreshToken, salt);
		await this._userService.update(id, {
			refreshToken: hashedRefreshToken,
		});
	}

	async getTokens(id: number, email: string): Promise<SessionDto> {
		const [accessToken, refreshToken] = await Promise.all([
			this._jwtService.signAsync(
				{
					sub: id,
					email,
				},
				{
					secret: process.env.JWT_SECRET,
					expiresIn: '1d',
				}
			),
			this._jwtService.signAsync(
				{
					sub: id,
					email,
				},
				{
					secret: process.env.JWT_SECRET,
					expiresIn: '7d',
				}
			),
		]);

		const tokens: SessionDto = {
			accessToken,
			refreshToken,
		};

		return tokens;
	}
}
