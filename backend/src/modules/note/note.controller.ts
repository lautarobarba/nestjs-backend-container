import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { User } from 'modules/user/user.entity';
import { UserService } from 'modules/user/user.service';
import { CreateNoteDto, UpdateNoteDto } from './note.dto';
import { Note } from './note.entity';
import { NoteService } from './note.service';
import { IsEmailConfirmedGuard } from 'modules/auth/guards/is-email-confirmed.guard';

@ApiTags('Notas')
@Controller('note')
export class NoteController {
	constructor(
		private readonly _noteService: NoteService,
		private readonly _userService: UserService
	) { }
	private readonly _logger = new Logger(NoteController.name);

	@Post()
	@UseGuards(IsEmailConfirmedGuard())
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: HttpStatus.CREATED,
		type: Note,
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: 'Error: Keys already in use',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({
		status: HttpStatus.NOT_ACCEPTABLE,
		description: 'Error: Not Acceptable',
	})
	async create(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() createNoteDto: CreateNoteDto
	): Promise<Note> {
		this._logger.debug('POST: /api/note');
		const actor: User = await this._userService.getUserFromRequest(request);
		response.status(HttpStatus.CREATED);
		return this._noteService.create(createNoteDto, actor);
	}

	@Get()
	@UseGuards(IsEmailConfirmedGuard())
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
		isArray: true,
	})
	@ApiResponse({ 
		status: HttpStatus.UNAUTHORIZED, 
		description: 'Error: Unauthorized' 
	})
	async findAll(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	): Promise<Note[]> {
		this._logger.debug('GET: /api/note');
		const actor: User = await this._userService.getUserFromRequest(request);
		response.status(HttpStatus.OK);
		return this._noteService.findAll(actor);
	}

	@Get(':id')
	@UseGuards(IsEmailConfirmedGuard())
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({ 
		status: HttpStatus.UNAUTHORIZED, 
		description: 'Error: Unauthorized' 
	})
	async findOne(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Param('id', ParseIntPipe) id: number
	): Promise<Note> {
		this._logger.debug('GET: /api/note/:id');
		const actor: User = await this._userService.getUserFromRequest(request);
		response.status(HttpStatus.OK);
		return this._noteService.findOne(id, actor);
	}

	@Patch()
	@UseGuards(IsEmailConfirmedGuard())
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: 'Error: Keys already in use',
	})
	@ApiResponse({ 
		status: HttpStatus.UNAUTHORIZED, 
		description: 'Error: Unauthorized' 
	})
	async update(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() updateNoteDto: UpdateNoteDto
	): Promise<Note> {
		this._logger.debug('PATCH: /api/note');
		const actor: User = await this._userService.getUserFromRequest(request);
		response.status(HttpStatus.OK);
		return this._noteService.update(updateNoteDto, actor);
	}

	@Delete(':id')
	@UseGuards(IsEmailConfirmedGuard())
	@ApiBearerAuth()
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Error: Not Found',
	})
	@ApiResponse({ 
		status: HttpStatus.UNAUTHORIZED, 
		description: 'Error: Unauthorized' 
	})
	async delete(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Param('id', ParseIntPipe) id: number
	): Promise<void> {
		this._logger.debug('DELETE: /api/note/:id');
		const actor: User = await this._userService.getUserFromRequest(request);
		response.status(HttpStatus.OK);
		return this._noteService.delete(id, actor);
	}
}
