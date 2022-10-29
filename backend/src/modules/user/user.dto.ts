import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'modules/role/role.enum';

export class CreateUserDto {
	@ApiProperty()
	email: string;

	@ApiProperty()
	firstname: string;

	@ApiProperty()
	lastname: string;

	@ApiProperty()
	password: string;
}

export class UpdateUserDto {
	@ApiProperty()
	id: number;

	@ApiPropertyOptional()
	email?: string;

	@ApiPropertyOptional()
	isEmailConfirmed?: boolean;

	@ApiPropertyOptional()
	firstname: string;

	@ApiPropertyOptional()
	lastname: string;

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