import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { MulterModule } from "@nestjs/platform-express";
import { ImageModule } from "modules/image/image.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => ImageModule)],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
