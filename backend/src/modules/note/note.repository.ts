import { EntityRepository, Repository } from 'typeorm';
import { Note } from './note.entity';

@EntityRepository(Note)
export class NoteRepository extends Repository<Note> {}
