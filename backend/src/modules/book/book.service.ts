import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ADMIN_ROLE_NAME } from "modules/auth/role.constants";
import { User } from "modules/user/user.entity";
import { UserService } from "modules/user/user.service";
import { Repository } from "typeorm";
import * as moment from "moment";
import { validate } from "class-validator";
import { Book } from "./book.entity";
import { CreateBookDto, UpdateBookDto } from "./book.dto";
import { Note } from "modules/note/note.entity";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly _bookRepository: Repository<Book>,
    @InjectRepository(Note)
    private readonly _noteRepository: Repository<Note>,
    private readonly _userService: UserService
  ) {}
  private readonly _logger = new Logger(BookService.name);

  private isAdmin(user: User): boolean {
    return this._userService.hasRole(user, ADMIN_ROLE_NAME);
  }

  private async assertOwnershipOrAdmin(book: Book, actor: User): Promise<void> {
    if (this.isAdmin(actor)) return;
    if (!book.user || book.user.id !== actor.id) {
      throw new ForbiddenException("Error: Forbidden");
    }
  }

  async create(createBookDto: CreateBookDto, actor: User): Promise<Book> {
    this._logger.debug("create()");
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");

    const targetUserId = this.isAdmin(actor) && createBookDto.userId
      ? createBookDto.userId
      : actor.id;

    const targetUser = await this._userService.findOne(targetUserId);
    if (!targetUser) throw new NotFoundException("Error: Not Found");

    const exists = await this._bookRepository.findOne({
      where: { title: createBookDto.title, user: { id: targetUserId } as User },
      relations: ["user"],
    });
    if (exists && !exists.deleted) {
      throw new ConflictException("Error: Keys already in use");
    }

    if (exists && exists.deleted) {
      exists.description = createBookDto.description ?? null;
      exists.deleted = false;
      exists.updatedAt = timestamp;
      const errors = await validate(exists);
      if (errors.length > 0) throw new NotAcceptableException("Error: Not Acceptable");
      return this._bookRepository.save(exists);
    }

    const book = this._bookRepository.create();
    book.title = createBookDto.title;
    book.description = createBookDto.description ?? null;
    book.user = targetUser;
    book.createdAt = timestamp;
    book.updatedAt = timestamp;

    const errors = await validate(book);
    if (errors.length > 0) throw new NotAcceptableException("Error: Not Acceptable");
    return this._bookRepository.save(book);
  }

  async findAll(actor: User): Promise<Book[]> {
    this._logger.debug("findAll()");

    if (this.isAdmin(actor)) {
      return this._bookRepository.find({
        where: { deleted: false },
        relations: ["user"],
        order: { id: "ASC" },
      });
    }

    return this._bookRepository.find({
      where: { deleted: false, user: { id: actor.id } as User },
      relations: ["user"],
      order: { id: "ASC" },
    });
  }

  async findOne(id: number, actor: User): Promise<Book> {
    this._logger.debug("findOne()");
    const book = await this._bookRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!book || book.deleted) throw new NotFoundException("Error: Not Found");
    await this.assertOwnershipOrAdmin(book, actor);
    return book;
  }

  async update(updateBookDto: UpdateBookDto, actor: User): Promise<Book> {
    this._logger.debug("update()");
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");

    const book = await this._bookRepository.findOne({
      where: { id: updateBookDto.id },
      relations: ["user"],
    });
    if (!book || book.deleted) throw new NotFoundException("Error: Not Found");

    await this.assertOwnershipOrAdmin(book, actor);

    if (updateBookDto.title && updateBookDto.title !== book.title) {
      const exists = await this._bookRepository.findOne({
        where: { title: updateBookDto.title, user: { id: book.user.id } as User },
      });
      if (exists && !exists.deleted && exists.id !== book.id) {
        throw new ConflictException("Error: Keys already in use");
      }
      book.title = updateBookDto.title;
    }

    if (updateBookDto.description !== undefined) {
      book.description = updateBookDto.description ?? null;
    }

    if (updateBookDto.userId !== undefined) {
      if (!this.isAdmin(actor)) {
        throw new ForbiddenException("Error: Forbidden");
      }
      const targetUser = await this._userService.findOne(updateBookDto.userId);
      if (!targetUser) throw new NotFoundException("Error: Not Found");
      book.user = targetUser;
    }

    book.updatedAt = timestamp;
    const errors = await validate(book);
    if (errors.length > 0) throw new NotAcceptableException("Error: Not Acceptable");
    return this._bookRepository.save(book);
  }

  async delete(id: number, actor: User): Promise<void> {
    this._logger.debug("delete()");
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");

    const book = await this._bookRepository.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!book || book.deleted) throw new NotFoundException("Error: Not Found");

    await this.assertOwnershipOrAdmin(book, actor);

    const notesCount = await this._noteRepository.count({
      where: { book: { id: book.id } as Book, deleted: false },
    });
    if (notesCount > 0) {
      throw new BadRequestException("Error: Book has notes");
    }

    book.deleted = true;
    book.updatedAt = timestamp;
    const errors = await validate(book);
    if (errors.length > 0) throw new NotAcceptableException("Error: Not Acceptable");
    await this._bookRepository.save(book);
  }

  async findOneForActor(id: number, actor: User): Promise<Book> {
    return this.findOne(id, actor);
  }
}
