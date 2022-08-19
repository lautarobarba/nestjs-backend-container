import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
	@ApiProperty()
	email: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	password: string;
}

export class UpdateUserDto {
	@ApiPropertyOptional()
	name?: string;

	@ApiPropertyOptional()
	refreshToken?: string;

	@ApiPropertyOptional()
	status?: string;
}

export class UserDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	email: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	refreshToken: string;

	@ApiProperty()
	status: string;

	@ApiProperty()
	isAdmin: boolean;

	@ApiProperty()
	created: Date;

	@ApiProperty()
	updated: Date;

	@ApiProperty()
	deleted: boolean;
}
