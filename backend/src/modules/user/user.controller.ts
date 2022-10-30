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
	HttpStatus,
	UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../auth/guards/jwt-authentication.guard';
import { Response, Request } from 'express';
import { IJWTPayload } from '../auth/jwt-payload.interface';
import { UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { RoleGuard } from 'modules/auth/guards/role.guard';
import { Role } from 'modules/auth/role.enum';
import { IsEmailConfirmedGuard } from 'modules/auth/guards/is-email-confirmed.guard';

@Controller('user')
@ApiTags('Usuarios')
export class UserController {
	constructor(private readonly _userService: UserService) {}

	@Get()
	@UseGuards(RoleGuard([Role.ADMIN]))
	@UseGuards(IsEmailConfirmedGuard())
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiBearerAuth()
	@ApiResponse({
		status: HttpStatus.OK,
		type: User,
		isArray: true,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Error: Unauthorized',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Error: Forbidden',
	})
	async findAll(): Promise<User[]> {
		return this._userService.findAll();
	}

	@Get(':id')
	@UseGuards(IsEmailConfirmedGuard())
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiBearerAuth()
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
		@Param('id') id: number
	): Promise<User> {
		return this._userService.findOne(id);
	}

	@Patch()
	@UseGuards(IsEmailConfirmedGuard())
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiBearerAuth()
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
		// Sólo administradores y propietarios pueden editar
		const user: User = await this._userService.getUserFromRequest(request);
		if ((user.role !== Role.ADMIN) && (user.id !== updateUserDto.id))
			throw new UnauthorizedException('Not allow');
		
		return this._userService.update(updateUserDto);
	}

	@Delete(':id')
	@UseGuards(RoleGuard([Role.ADMIN]))
	@UseGuards(IsEmailConfirmedGuard())
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiBearerAuth()
	@ApiResponse({
		status: HttpStatus.OK,
	})
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
		return this._userService.delete(id);
	}
}
