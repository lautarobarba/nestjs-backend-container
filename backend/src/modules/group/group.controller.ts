import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";
import { Group } from "./group.entity";
import { GroupService } from "./group.service";
import { ApiTags } from "@nestjs/swagger";

@Crud({
  model: {
    type: Group,
  },
})
@ApiTags("Grupos")
@Controller("group")
export class GroupController implements CrudController<Group> {
  constructor(public service: GroupService) {}
}
