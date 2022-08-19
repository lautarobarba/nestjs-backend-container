import { ApiProperty } from '@nestjs/swagger';

export class EmailTestDto {
	@ApiProperty()
	emailTo: string;
}
