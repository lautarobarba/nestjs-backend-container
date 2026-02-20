# Book/Note Ownership Refactor Design

## Summary
Refactor data model to `User 1:N Book` and `Book 1:N Note`, with custom controllers enforcing ownership rules and admin override.

## Ownership Rules
- Normal users can CRUD only their own books.
- Normal users can CRUD only notes that belong to their own books.
- `Administrador` can CRUD all books and notes.

## Delete Rule
- Deleting a book is blocked if it has non-deleted notes.
- Enforced in service logic and with `RESTRICT` foreign key from `notes.book_id` to `books.id`.

## Migration
- Add `books` table.
- Add `notes.book_id`.
- Migrate notes from legacy `notes.user_id` into per-user migration books.
- Drop `notes.user_id`.

## API Style
- Keep custom controllers (`BookController`, `NoteController`) for ownership checks.
- Structure aligned with current modernized modules: guards, typed DTOs, consistent responses.
