import { CanActivate, ExecutionContext, Injectable, Logger, mixin, Type } from '@nestjs/common';
import { RequestWithUser } from '../request-with-user.interface';
import { JwtAuthenticationGuard } from 'modules/auth/guards/jwt-authentication.guard';
import { User } from 'modules/user/user.entity';
import { IJWTPayload } from 'modules/auth/jwt-payload.interface';
import { UserService } from 'modules/user/user.service';

export const RoleGuard = (roles: string[]): Type<CanActivate> => {
  @Injectable()
  class RoleGuardMixin extends JwtAuthenticationGuard {
    constructor(
      private readonly _userService: UserService
    ) { super() }
    private readonly _logger = new Logger(RoleGuardMixin.name);

    async canActivate(context: ExecutionContext) {

      // Check if the user is authenticated with JwtAuthenticationGuard 
      await super.canActivate(context);

      const request: RequestWithUser = context.switchToHttp().getRequest<RequestWithUser>();
      const payload: IJWTPayload = request.user;
      const user: User = await this._userService.findOne(payload.sub);
      const userRoleNames = (user.roles ?? []).map((role) => role.name.toLowerCase());
      const requiredRoles = roles.map((role) => role.toLowerCase());
      const isAllowed = requiredRoles.some((role) => userRoleNames.includes(role));

      if (!isAllowed) {
        this._logger.debug(`El usuario ${user.email} NO PUEDE INGRESAR. Roles: ${userRoleNames.join(", ")}`);
      }

      return isAllowed;
    }
  }

  return mixin(RoleGuardMixin);
}
