import {
  ConflictException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "modules/user/user.service";
import { Repository } from "typeorm";
import { CreateNoteDto, UpdateNoteDto } from "./note.dto";
import { Note } from "./note.schema";
import * as moment from "moment";
import { validate } from "class-validator";

@Injectable()
export class NoteService {
  constructor() {}
  private readonly _logger = new Logger(NoteService.name);

  async test(...params) {
    this._logger.debug("test()");
    console.log(params);
    return "test";
  }
}
