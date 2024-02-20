import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "modules/user/user.module";
import { NoteController } from "./note.controller";
import { Note } from "./note.schema";
import { NoteService } from "./note.service";

@Module({
  imports: [],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
