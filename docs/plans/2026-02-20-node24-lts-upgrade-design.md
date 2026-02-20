# Node 24 LTS Upgrade Design

## Summary
Upgrade container runtime/build environment to Node 24 LTS and keep all Node libraries at the newest installable versions without removing dependencies.

## Scope
- Update Docker base images used by development and runtime stages.
- Keep dependency set intact.
- Resolve type-level breakages introduced by dependency upgrades.

## Decisions
- Use `node:24-bookworm-slim` for `base` and `runtime` stages in `Dockerfile`.
- Keep packages at newest installable versions (`Current == Wanted`), even when npm `latest` dist-tag is lower or incompatible.
- Keep `yargs` on `^17.7.2` due peer constraint from `nestjs-command@3.1.5`.

## Validation
- Confirm `node -v` and `npm -v` inside `nest_back`.
- Run `npm outdated` and confirm no pending `Wanted` upgrades.
- Run `npm run build` and fix compilation errors caused by updated typings.
