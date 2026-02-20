import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ADMIN_ROLE_NAME } from "modules/auth/role.constants";
import { Book } from "modules/book/book.entity";
import { User } from "modules/user/user.entity";
import { UserService } from "modules/user/user.service";
import { Repository } from "typeorm";
import { CreateNoteDto, UpdateNoteDto } from "./note.dto";
import { Note } from "./note.entity";
import * as moment from "moment";
import { validate } from "class-validator";

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private readonly _noteRepository: Repository<Note>,
    @InjectRepository(Book)
    private readonly _bookRepository: Repository<Book>,
    private readonly _userService: UserService
  ) {}
  private readonly _logger = new Logger(NoteService.name);

  private isAdmin(user: User): boolean {
    return this._userService.hasRole(user, ADMIN_ROLE_NAME);
  }

  private async getBookForActor(bookId: number, actor: User): Promise<Book> {
    const book = await this._bookRepository.findOne({
      where: { id: bookId, deleted: false },
      relations: ["user"],
    });
    if (!book) throw new NotFoundException("Error: Not Found");
    if (!this.isAdmin(actor) && book.user.id !== actor.id) {
      throw new ForbiddenException("Error: Forbidden");
    }
    return book;
  }

  private async getNoteForActor(noteId: number, actor: User): Promise<Note> {
    const note = await this._noteRepository.findOne({
      where: { id: noteId },
      relations: ["book", "book.user"],
    });
    if (!note || note.deleted) throw new NotFoundException("Error: Not Found");
    if (!this.isAdmin(actor) && note.book.user.id !== actor.id) {
      throw new ForbiddenException("Error: Forbidden");
    }
    return note;
  }

  async create(createNoteDto: CreateNoteDto, actor: User): Promise<Note> {
    this._logger.debug("create()");
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");
    const { title, content, bookId } = createNoteDto;

    const book = await this.getBookForActor(bookId, actor);

    const exists: Note = await this._noteRepository.findOne({
      where: { title },
    });

    if (exists && !exists.deleted) {
      throw new ConflictException("Error: Keys already in use");
    }

    if (exists && exists.deleted) {
      exists.content = content;
      exists.book = book;
      exists.deleted = false;
      exists.updatedAt = timestamp;

      const errors = await validate(exists);
      if (errors.length > 0) throw new NotAcceptableException("Error: Not Acceptable");
      return this._noteRepository.save(exists);
    }

    const note: Note = this._noteRepository.create();
    note.title = title;
    note.content = content;
    note.book = book;
    note.updatedAt = timestamp;
    note.createdAt = timestamp;

    const errors = await validate(note);
    if (errors.length > 0) throw new NotAcceptableException("Error: Not Acceptable");
    return this._noteRepository.save(note);
  }

  async findAll(actor: User): Promise<Note[]> {
    this._logger.debug("findAll()");

    if (this.isAdmin(actor)) {
      return this._noteRepository.find({
        where: { deleted: false },
        order: { id: "ASC" },
        relations: ["book", "book.user"],
      });
    }

    return this._noteRepository.find({
      where: { deleted: false, book: { user: { id: actor.id } as User } as Book },
      order: { id: "ASC" },
      relations: ["book", "book.user"],
    });
  }

  async findOne(id: number, actor: User): Promise<Note> {
    this._logger.debug("findOne()");
    return this.getNoteForActor(id, actor);
  }

  async update(updateNoteDto: UpdateNoteDto, actor: User): Promise<Note> {
    this._logger.debug("update()");
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");
    const { id, title, content, bookId } = updateNoteDto;

    const note = await this.getNoteForActor(id, actor);

    if (title && title !== note.title) {
      const exists = await this._noteRepository.findOne({ where: { title } });
      if (exists && !exists.deleted && exists.id !== id) {
        throw new ConflictException("Error: Keys already in use");
      }
      note.title = title;
    }

    if (content) note.content = content;

    if (bookId) {
      note.book = await this.getBookForActor(bookId, actor);
    }

    note.updatedAt = timestamp;
    const errors = await validate(note);
    if (errors.length > 0) throw new NotAcceptableException("Error: Not Acceptable");
    return this._noteRepository.save(note);
  }

  async delete(id: number, actor: User): Promise<void> {
    this._logger.debug("delete()");
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");

    const note = await this.getNoteForActor(id, actor);
    note.deleted = true;
    note.updatedAt = timestamp;

    const errors = await validate(note);
    if (errors.length > 0) throw new NotAcceptableException("Error: Not Acceptable");
    await this._noteRepository.save(note);
  }
}
