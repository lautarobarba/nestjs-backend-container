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
	NotFoundException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from 'modules/user/user.dto';
import { User } from 'modules/user/user.entity';
import { UserService } from 'modules/user/user.service';
import { LoginDto, SessionDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard';
import { IJWTPayload } from './jwt-payload.interface';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly _authService: AuthService,
		private readonly _userService: UserService
	) {}

	@Post('register')
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'User created',
		type: SessionDto,
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: 'Error: Keys already in use',
	})
	async register(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() createUserDto: CreateUserDto
	): Promise<SessionDto> {
		const ulrToImportCssInEmail: string = `${request.protocol}://host.docker.internal:${process.env.BACK_PORT}`;
    const ulrToImportImagesInEmail: string = `${request.protocol}://${request.get('Host')}`;
		response.status(HttpStatus.CREATED);
		return this._authService.register(
			ulrToImportCssInEmail,
			ulrToImportImagesInEmail,
			createUserDto
		);
	}

	@Post('login')
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({ 
		status: HttpStatus.OK, 
		description: 'User logged in', 
		type: SessionDto 
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Error: Unauthorized',
	})
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
	@ApiResponse({ 
		status: HttpStatus.OK, 
		description: 'New token generated', 
		type: SessionDto 
	})
	async refreshTokens(@Req() request: Request): Promise<SessionDto> {
		const { payload, refreshToken } = request.user as {
			payload: IJWTPayload;
			refreshToken: string;
		};
		const user: User = await this._userService.findOne(payload.sub);

		return this._authService.refreshTokens(user.id, refreshToken);
	}

	@Post('logout')
	@UseGuards(JwtAuthenticationGuard)
	@ApiBearerAuth()
	@ApiResponse({ 
		status: HttpStatus.OK, 
		description: 'User logged out' 
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({ 
		status: HttpStatus.UNAUTHORIZED, 
		description: 'Error: Unauthorized' 
	})
	async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	) {
		const session: IJWTPayload = request.user as IJWTPayload;
		const user: User = await this._userService.findOne(session.sub);
		response.status(HttpStatus.OK);
		await this._authService.logout(user.id);
	}

	@Post('email-confirmation/send')
	@UseGuards(JwtAuthenticationGuard)
	@ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ 
		status: HttpStatus.OK, 
	  description: 'Email sent',
	})
  @ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({ 
		status: HttpStatus.UNAUTHORIZED, 
		description: 'Error: Unauthorized' 
	})
  async sendEmailConfirmationEmail(
    @Req() request: Request,
  ) {
    const ulrToImportCssInEmail: string = `${request.protocol}://host.docker.internal:${process.env.BACK_PORT}`;
    const ulrToImportImagesInEmail: string = `${request.protocol}://${request.get('Host')}`;

		const session: IJWTPayload = request.user as IJWTPayload;
		const user: User = await this._userService.findOne(session.sub);

		if(!user) throw new NotFoundException('User does not exists');

    return this._authService.sendEmailConfirmationEmail(
      ulrToImportCssInEmail, 
      ulrToImportImagesInEmail, 
      user
    );
  }

	@Post('email-confirmation/confirm')
	@UseGuards(JwtAuthenticationGuard)
	@ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ 
		status: HttpStatus.OK, 
	  description: 'Email sent',
	})
  @ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({ 
		status: HttpStatus.UNAUTHORIZED, 
		description: 'Error: Unauthorized' 
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Error: Email already confirmed',
	})
  async confirmEmail(
    @Req() request: Request,
  ) {
    const ulrToImportCssInEmail: string = `${request.protocol}://host.docker.internal:${process.env.BACK_PORT}`;
    const ulrToImportImagesInEmail: string = `${request.protocol}://${request.get('Host')}`;

		const session: IJWTPayload = request.user as IJWTPayload;
		const user: User = await this._userService.findOne(session.sub);

		if(!user) throw new NotFoundException('User does not exists');

    return this._authService.confirmEmail(
      ulrToImportCssInEmail, 
      ulrToImportImagesInEmail, 
      user
    );
  }

	@Get('test-auth')
	@UseGuards(JwtAuthenticationGuard)
	@ApiBearerAuth()
	@ApiResponse({ 
		status: HttpStatus.OK, 
	})
	async testPrivateRoute(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	): Promise<string> {
		const session: IJWTPayload = request.user as IJWTPayload;
		const user: User = await this._userService.findOne(session.sub);
		response.status(HttpStatus.OK);
		return this._authService.testPrivateRoute(user.id);
	}

	// @Get('test-email-confirmed')
	// @UseGuards(JwtAuthenticationGuard)
	// @ApiBearerAuth()
	// @ApiResponse({ 
	// 	status: HttpStatus.OK, 
	// })
	// async testEmailConfirmed(
	// 	@Req() request: Request,
	// 	@Res({ passthrough: true }) response: Response
	// ): Promise<string> {
	// 	console.log('TODO: FALTA CONTROLAR POR EMAIL CONFIRMADO USANDO EL DECORADOR')
	// 	return this._authService.testEmailConfirmed(user.id);
	// }

	// @Get('test-role-permission')
	// @UseGuards(JwtAuthenticationGuard)
	// @ApiBearerAuth()
	// @ApiResponse({ 
	// 	status: HttpStatus.OK, 
	// })
	// async testRolePermission(
	// 	@Req() request: Request,
	// 	@Res({ passthrough: true }) response: Response
	// ): Promise<string> {
	// 	console.log('TODO: FALTA CONTROLAR POR ROLE USANDO EL DECORADOR')
	// 	return this._authService.testRolePermission(user.id);
	// }
}
