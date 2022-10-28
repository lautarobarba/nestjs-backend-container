import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'modules/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from 'modules/role/role.guard';

@Module({
	imports: [JwtModule.register({}), UserModule],
	controllers: [AuthController],
	providers: [
		AuthService, 
		AccessTokenStrategy, 
		RefreshTokenStrategy,
	],
})
export class AuthModule {}
