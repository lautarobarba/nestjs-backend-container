import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
	@ApiProperty()
	email: string;

	@ApiProperty()
	password: string;
}

export class SessionDto {
	@ApiProperty()
	accessToken: string;

	@ApiProperty()
	refreshToken: string;
}
