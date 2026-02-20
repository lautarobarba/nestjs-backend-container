import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
	@ApiProperty()
	title: string;

	@ApiProperty()
	content: string;

	@ApiProperty()
	bookId: number;
}

export class UpdateNoteDto {
	@ApiProperty()
	id: number;

	@ApiPropertyOptional()
	title?: string;

	@ApiPropertyOptional()
	content?: string;

	@ApiPropertyOptional()
	bookId?: number;
}
