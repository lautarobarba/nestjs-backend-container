import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
	Res,
	UseGuards,
	UnauthorizedException,
	UseInterceptors,
	HttpStatus,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from 'modules/auth/guards/accessToken.guard';
import { Response, Request } from 'express';
import { IJWTPayload } from 'modules/auth/jwt-payload.interface';
import { User } from 'modules/user/user.entity';
import { UserService } from 'modules/user/user.service';
import { CreateNoteDto, NoteDto, UpdateNoteDto } from './note.dto';
import { Note } from './note.entity';
import { NoteService } from './note.service';

@ApiTags('Notas')
@Controller('note')
export class NoteController {
	constructor(
		private readonly _noteService: NoteService,
		private readonly _userService: UserService
	) {}

	@Post()
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({ status: 201, description: 'Note created', type: NoteDto })
	@ApiResponse({ status: 409, description: 'Error: Conflict' })
	async create(
		@Res({ passthrough: true }) response: Response,
		@Body() createNoteDto: CreateNoteDto
	): Promise<Note> {
		response.status(HttpStatus.CREATED);
		return this._noteService.create(createNoteDto);
	}

	@Get()
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: 200,
		description: 'Note list',
		type: NoteDto,
		isArray: true,
	})
	@ApiResponse({ status: 401, description: 'Error: Unauthorized' })
	async findAll(
		@Res({ passthrough: true }) response: Response
	): Promise<Note[]> {
		response.status(HttpStatus.OK);
		return this._noteService.findAll();
	}

	@Get(':id')
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: 200,
		description: 'Note detail',
		type: NoteDto,
	})
	@ApiResponse({ status: 401, description: 'Error: Unauthorized' })
	async findOne(
		@Res({ passthrough: true }) response: Response,
		@Param('id') id: number
	): Promise<Note> {
		response.status(HttpStatus.OK);
		return this._noteService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: 200,
		description: 'Note updated',
		type: NoteDto,
	})
	@ApiResponse({ status: 401, description: 'Error: Unauthorized' })
	async update(
		@Res({ passthrough: true }) response: Response,
		@Param('id') id: number,
		@Body() updateNoteDto: UpdateNoteDto
	): Promise<Note> {
		response.status(HttpStatus.OK);
		return this._noteService.update(id, updateNoteDto);
	}

	@Delete(':id')
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: 200,
		description: 'Note deleted',
		type: null,
	})
	@ApiResponse({ status: 401, description: 'Error: Unauthorized' })
	async delete(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Param('id') id: number
	): Promise<void> {
		const session: IJWTPayload = request.user as IJWTPayload;
		const user: User = await this._userService.findOne(session.sub);
		if (!user.isAdmin) {
			throw new UnauthorizedException('Not admin');
		}
		response.status(HttpStatus.OK);
		return this._noteService.delete(id);
	}
}
