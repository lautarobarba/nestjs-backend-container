import {
	ClassSerializerInterceptor,
	Controller,
	Get,
	Patch,
	Delete,
	Param,
	Body,
	Req,
	Res,
	UseGuards,
	UseInterceptors,
	UnauthorizedException,
	HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { Response, Request } from 'express';
import { IJWTPayload } from '../auth/jwt-payload.interface';
import { UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@ApiTags('Usuarios')
@Controller('user')
export class UserController {
	constructor(private readonly _userService: UserService) {}

	@Get()
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: HttpStatus.OK,
		type: User,
		isArray: true,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Error: Unauthorized',
	})
	async findAll(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	): Promise<User[]> {
		// const session: IJWTPayload = request.user as IJWTPayload;
		// const user: User = await this._userService.findOne(session.sub);
		// if (!user.isAdmin) {
		// 	throw new UnauthorizedException('Not admin');
		// }
		// response.status(HttpStatus.OK);
		return this._userService.findAll();
	}

	@Get(':id')
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: HttpStatus.OK,
		type: User,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Error: Unauthorized',
	})
	async findOne(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Param('id') id: number
	): Promise<User> {
		// const session: IJWTPayload = request.user as IJWTPayload;
		// const user: User = await this._userService.findOne(session.sub);
		// if (!user.isAdmin && Number(user.id) !== Number(id)) {
		// 	throw new UnauthorizedException('Not allow');
		// }
		// response.status(HttpStatus.OK);
		return this._userService.findOne(id);
	}

	@Patch()
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: HttpStatus.OK,
		type: User,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Error: Unauthorized',
	})
	async update(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() updateUserDto: UpdateUserDto
	): Promise<User> {
		// const session: IJWTPayload = request.user as IJWTPayload;
		// const user: User = await this._userService.findOne(session.sub);
		// if (!user.isAdmin && Number(user.id) !== Number(id)) {
		// 	throw new UnauthorizedException('Not allow');
		// }
		// response.status(HttpStatus.OK);
		return this._userService.update(updateUserDto);
	}

	@Delete(':id')
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Error: Unauthorized',
	})
	async delete(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Param('id') id: number
	): Promise<void> {
		// const session: IJWTPayload = request.user as IJWTPayload;
		// const user: User = await this._userService.findOne(session.sub);
		// if (!user.isAdmin) {
		// 	throw new UnauthorizedException('Not admin');
		// }
		// response.status(HttpStatus.OK);
		return this._userService.delete(id);
	}
}
