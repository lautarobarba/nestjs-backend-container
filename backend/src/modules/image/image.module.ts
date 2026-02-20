import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "modules/user/user.module";
import { ImageService } from "./image.service";
import { Image } from "./image.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Image]), forwardRef(() => UserModule)],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
