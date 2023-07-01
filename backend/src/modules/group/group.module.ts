import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Group } from "./group.entity";
import { GroupService } from "./group.service";
import { GroupController } from "./group.controller";
@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupService],
  exports: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
