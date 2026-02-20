import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";
import { Role } from "./role.entity";
import { RoleService } from "./role.service";
import { ApiTags } from "@nestjs/swagger";

@Crud({
  model: {
    type: Role,
  },
})
@ApiTags("Roles")
@Controller("role")
export class RoleController implements CrudController<Role> {
  constructor(public service: RoleService) {}
}
