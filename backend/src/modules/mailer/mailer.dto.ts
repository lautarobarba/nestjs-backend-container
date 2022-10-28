import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailTestDto {
	@ApiProperty()
	emailTo: string;
}

export class EmailDto {
	@ApiProperty()
	userId: number;
}