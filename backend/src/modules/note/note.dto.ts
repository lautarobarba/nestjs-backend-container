import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from 'modules/user/user.dto';

export class CreateNoteDto {
	@ApiProperty()
	title: string;

	@ApiProperty()
	content: string;

	@ApiProperty()
	author: number;
}

export class UpdateNoteDto {
	@ApiPropertyOptional()
	title?: string;

	@ApiPropertyOptional()
	content?: string;
}

export class NoteDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	title: string;

	@ApiProperty()
	content: string;

	@ApiProperty()
	author: UserDto;

	@ApiProperty()
	created: Date;

	@ApiProperty()
	updated: Date;

	@ApiProperty()
	deleted: boolean;
}
