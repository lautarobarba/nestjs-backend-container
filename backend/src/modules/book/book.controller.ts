import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { JwtAuthenticationGuard } from "modules/auth/guards/jwt-authentication.guard";
import { IsEmailConfirmedGuard } from "modules/auth/guards/is-email-confirmed.guard";
import { User } from "modules/user/user.entity";
import { UserService } from "modules/user/user.service";
import { Book } from "./book.entity";
import { BookService } from "./book.service";
import { CreateBookDto, UpdateBookDto } from "./book.dto";

@ApiTags("Libros")
@Controller("book")
export class BookController {
  constructor(
    private readonly _bookService: BookService,
    private readonly _userService: UserService
  ) {}
  private readonly _logger = new Logger(BookController.name);

  @Post()
  @UseGuards(IsEmailConfirmedGuard())
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ status: HttpStatus.CREATED, type: Book })
  async create(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() createBookDto: CreateBookDto
  ): Promise<Book> {
    this._logger.debug("POST: /api/book");
    const actor: User = await this._userService.getUserFromRequest(request);
    response.status(HttpStatus.CREATED);
    return this._bookService.create(createBookDto, actor);
  }

  @Get()
  @UseGuards(IsEmailConfirmedGuard())
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: Book, isArray: true })
  async findAll(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<Book[]> {
    this._logger.debug("GET: /api/book");
    const actor: User = await this._userService.getUserFromRequest(request);
    response.status(HttpStatus.OK);
    return this._bookService.findAll(actor);
  }

  @Get(":id")
  @UseGuards(IsEmailConfirmedGuard())
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: Book })
  async findOne(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param("id", ParseIntPipe) id: number
  ): Promise<Book> {
    this._logger.debug("GET: /api/book/:id");
    const actor: User = await this._userService.getUserFromRequest(request);
    response.status(HttpStatus.OK);
    return this._bookService.findOne(id, actor);
  }

  @Patch()
  @UseGuards(IsEmailConfirmedGuard())
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: Book })
  async update(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() updateBookDto: UpdateBookDto
  ): Promise<Book> {
    this._logger.debug("PATCH: /api/book");
    const actor: User = await this._userService.getUserFromRequest(request);
    response.status(HttpStatus.OK);
    return this._bookService.update(updateBookDto, actor);
  }

  @Delete(":id")
  @UseGuards(IsEmailConfirmedGuard())
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK })
  async delete(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    this._logger.debug("DELETE: /api/book/:id");
    const actor: User = await this._userService.getUserFromRequest(request);
    response.status(HttpStatus.OK);
    return this._bookService.delete(id, actor);
  }
}
