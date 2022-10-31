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
	BadRequestException,
	UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../auth/guards/jwt-authentication.guard';
import { Response, Request, Express } from 'express';
import { IJWTPayload } from '../auth/jwt-payload.interface';
import { UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { RoleGuard } from 'modules/auth/guards/role.guard';
import { Role } from '../auth/role.enum';
import { IsEmailConfirmedGuard } from 'modules/auth/guards/is-email-confirmed.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LocalFilesInterceptor } from 'modules/utils/localFiles.interceptor';


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
	// @UseGuards(IsEmailConfirmedGuard())
	// @UseInterceptors(ClassSerializerInterceptor)
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
	// @UseGuards(IsEmailConfirmedGuard())
	// @UseInterceptors(ClassSerializerInterceptor)
	@UseInterceptors(LocalFilesInterceptor({
		fieldName: 'profilePicture', 
		path: '/temp'
	}))
	// @UseInterceptors(LocalFilesInterceptor({
  //   fieldName: 'file',
  //   path: '/avatars',
  //   fileFilter: (request, file, callback) => {
  //     if (!file.mimetype.includes('image')) {
  //       return callback(new BadRequestException('Provide a valid image'), false);
  //     }
  //     callback(null, true);
  //   },
  //   limits: {
  //     fileSize: Math.pow(1024, 2) // 1MB
  //   }
  // }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User attributes',
    type: UpdateUserDto,
  })
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
		@Body() updateUserDto: UpdateUserDto,
		@UploadedFile() profilePicture?: Express.Multer.File,
	): Promise<User> {
		// Sólo administradores y propietarios pueden editar
		// const user: User = await this._userService.getUserFromRequest(request);

		// if ((user.role !== Role.ADMIN) && (user.id != updateUserDto.id))
		// 	throw new UnauthorizedException('Not allow');
		
		// Agrego la foto de perfil al DTO para enviarlo al service
		updateUserDto.profilePicture = profilePicture;

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
