# DB Engine Selection Design

## Summary
Select the database engine at runtime via `DB_ENGINE` and fail fast on invalid values. Only `mysql` and `postgresql` are supported. The database module will validate the value and map it to the TypeORM `type` before initializing the connection.

## Behavior
- Read `DB_ENGINE` from environment.
- Accept only `mysql` or `postgresql` (case-insensitive normalization to lowercase).
- If `DB_ENGINE` is missing: throw an error at boot with a clear message.
- If `DB_ENGINE` is invalid: throw an error at boot with allowed values.

## Architecture
- Implemented inside `backend/src/database/database.module.ts`.
- Add a small helper function to validate and map `DB_ENGINE` to the TypeORM `type`.
- No new dependencies or modules.

## Error Messages
- Missing `DB_ENGINE`:
  - `DB_ENGINE no definido. Valores permitidos: mysql, postgresql`
- Invalid `DB_ENGINE`:
  - `DB_ENGINE invalido: "<valor>". Valores permitidos: mysql, postgresql`

## Testing
- No tests added in this change. If needed later, add a unit test for the validator.
