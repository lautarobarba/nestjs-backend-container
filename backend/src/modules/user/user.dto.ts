import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'modules/role/role.enum';

export class CreateUserDto {
	@ApiProperty()
	email: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	password: string;
}

export class UpdateUserDto {
	@ApiProperty()
	id: number;

	@ApiPropertyOptional()
	email?: string;

	@ApiPropertyOptional()
	name?: string;

	@ApiPropertyOptional()
	status?: string;

	@ApiPropertyOptional()
	role?: Role;
}

export class ChangeUserPasswordDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	email: string;

	@ApiProperty()
	password: string;
}