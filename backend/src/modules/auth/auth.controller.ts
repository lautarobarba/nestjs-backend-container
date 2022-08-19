import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
	UseInterceptors,
	HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from 'modules/user/user.dto';
import { User } from 'modules/user/user.entity';
import { UserService } from 'modules/user/user.service';
import { LoginDto, SessionDto } from './auth.dto';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { IJWTPayload } from './jwt-payload.interface';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly _authService: AuthService,
		private readonly _userService: UserService
	) {}

	@Post('register')
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({ status: 201, description: 'User created', type: SessionDto })
	@ApiResponse({ status: 409, description: 'Error: Conflict' })
	async register(
		@Res({ passthrough: true }) response: Response,
		@Body() createUserDto: CreateUserDto
	): Promise<SessionDto> {
		response.status(HttpStatus.CREATED);
		return this._authService.register(createUserDto);
	}

	@Post('login')
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({ status: 200, description: 'User logged in', type: SessionDto })
	@ApiResponse({ status: 404, description: 'Error: Not Found' })
	@ApiResponse({ status: 401, description: 'Error: Unauthorized' })
	async login(
		@Res({ passthrough: true }) response: Response,
		@Body() loginDto: LoginDto
	): Promise<SessionDto> {
		response.status(HttpStatus.OK);
		return this._authService.login(loginDto);
	}

	@Post('refresh')
	@UseGuards(RefreshTokenGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'New token', type: SessionDto })
	async refreshTokens(@Req() request: Request): Promise<SessionDto> {
		const { payload, refreshToken } = request.user as {
			payload: IJWTPayload;
			refreshToken: string;
		};
		const user: User = await this._userService.findOne(payload.sub);

		return this._authService.refreshTokens(user.id, refreshToken);
	}

	@Post('logout')
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'User logged out' })
	@ApiResponse({ status: 404, description: 'Error: Not Found' })
	@ApiResponse({ status: 401, description: 'Error: Unauthorized' })
	async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	): Promise<void> {
		const session: IJWTPayload = request.user as IJWTPayload;
		const user: User = await this._userService.findOne(session.sub);
		response.status(HttpStatus.OK);
		await this._authService.logout(user.id);
	}

	@Get('test')
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'User logged' })
	async getPrivate(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	): Promise<string> {
		const session: IJWTPayload = request.user as IJWTPayload;
		const user: User = await this._userService.findOne(session.sub);
		response.status(HttpStatus.OK);
		return this._authService.getPrivate(user.id);
	}
}
