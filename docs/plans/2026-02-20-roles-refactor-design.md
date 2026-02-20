# Roles Refactor Design

## Summary
Refactor authorization model from legacy single `users.role` enum plus `groups` relation to a dynamic `roles` entity with `many-to-many` relation (`users_roles`), using a big-bang migration.

## Scope
- Replace `group` module/entity with `role` module/entity.
- Remove `role.enum.ts`.
- Migrate authorization checks to dynamic role names.
- Allow users to have multiple roles.
- Add default role `Administrador` in migration.

## Data Model
- New table: `roles` (`id`, `name`, timestamps).
- Pivot table: `users_roles` (`user_id`, `role_id`).
- Remove legacy `users.role` column and enum type.

## Migration Strategy
- Create `roles` and `users_roles`.
- Insert default role `Administrador`.
- Backfill from legacy `groups/groups_users` and from `users.role`.
- Drop legacy `groups/groups_users`.
- Drop `users.role` and `users_role_enum`.

## Authorization
- `RoleGuard` now checks role names (`string[]`) against `user.roles`.
- Admin checks use role name `Administrador`.

## Validation
- Compile with `npm run build`.
- Execute migrations and validate role-based endpoints.
