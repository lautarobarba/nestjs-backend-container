import { createParamDecorator } from '@nestjs/common';
// import { UserDto } from "../user/user.dto";
import { User } from '../user/user.entity';

// export const GetUser = createParamDecorator(
// 	(data, req): UserDto => {
// 		return req.user;
// 	}
// );

export const GetUser = createParamDecorator((data, req): User => req.user);
