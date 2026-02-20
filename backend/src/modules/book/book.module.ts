import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "modules/user/user.module";
import { Note } from "modules/note/note.entity";
import { BookController } from "./book.controller";
import { Book } from "./book.entity";
import { BookService } from "./book.service";

@Module({
  imports: [TypeOrmModule.forFeature([Book, Note]), UserModule],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
