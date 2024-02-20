import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthenticationGuard } from "modules/auth/guards/jwt-authentication.guard";
import { Response, Request } from "express";
import { IJWTPayload } from "modules/auth/jwt-payload.interface";
import { User } from "modules/user/user.entity";
import { UserService } from "modules/user/user.service";
import { CreateNoteDto, UpdateNoteDto } from "./note.dto";
import { Note } from "./note.schema";
import { NoteService } from "./note.service";

@ApiTags("Notas")
@Controller("note")
export class NoteController {
  constructor(
    private readonly _noteService: NoteService // private readonly _userService: UserService
  ) {}
  private readonly _logger = new Logger(NoteController.name);

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    status: HttpStatus.OK,
    // type: Note,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Error: Unauthorized",
  })
  async getNotes(@Res({ passthrough: true }) response: Response) {
    this._logger.debug("GET: /api/test");
    response.status(HttpStatus.OK);
    return this._noteService.test();
  }

  @Get("test")
  async test() {
    return this._noteService.test("params_1", "params_2");
  }
}
