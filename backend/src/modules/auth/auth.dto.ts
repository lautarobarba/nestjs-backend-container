import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'modules/user/user.dto';

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
