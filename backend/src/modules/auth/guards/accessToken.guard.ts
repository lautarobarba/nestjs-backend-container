import { Injectable } from '@nestjs/common';
import { AuthGuard , PassportModule } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {}
