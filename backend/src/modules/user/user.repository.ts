import { EntityRepository, Repository } from 'typeorm';
import { genSalt, hash } from 'bcryptjs';
import { CreateUserDto } from './user.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
