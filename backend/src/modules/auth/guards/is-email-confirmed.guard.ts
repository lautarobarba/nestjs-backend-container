import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';
import { RequestWithUser } from 'modules/auth/request-with-user.interface';
import { JwtAuthenticationGuard } from 'modules/auth/guards/jwt-authentication.guard';
import { User } from 'modules/user/user.entity';
import { IJWTPayload } from 'modules/auth/jwt-payload.interface';
import { UserService } from 'modules/user/user.service';

export const IsEmailConfirmedGuard = (): Type<CanActivate> => {
  @Injectable()
  class IsEmailConfirmedGuardMixin extends JwtAuthenticationGuard {
    constructor(
      private readonly _userService: UserService
    ) { super() }

    async canActivate(context: ExecutionContext) {

      // Check if the user is authenticated with JwtAuthenticationGuard 
      await super.canActivate(context);

      const request: RequestWithUser = context.switchToHttp().getRequest<RequestWithUser>();
      const payload: IJWTPayload = request.user;
      // console.log(payload);
      const user: User = await this._userService.findOne(payload.sub);
      // console.log(user);
			
			if (user.isEmailConfirmed) console.log(`El usuario ${user.email} tiene el correo electrónico confirmado. PUEDE INGRESAR`);
			else console.log(`El usuario ${user.email} no confirmó su correo electrónico. NO PUEDE INGRESAR. Role: ${user.role}`);

      return user.isEmailConfirmed;
    }
  }

  return mixin(IsEmailConfirmedGuardMixin);
}
