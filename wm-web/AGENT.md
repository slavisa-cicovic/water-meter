# Water Meter Web – Agent Notes

## Project context
This project is a water management system for municipalities (up to ~100k residents).
The frontend and backend are implemented in Next.js (full-stack). Mobile app (Expo) will be used for collecting water meter readings onsite.

Main features:
- buildings management
- meter management
- periodic meter readings
- monthly invoice generation (billing)
- account management (users/roles)

## Stack
- Next.js 15 app router (frontend + backend)
- TypeScript
- MUI + Tailwind
- SWR for data fetching
- MySQL (via Prisma or raw SQL)
- JWT auth (web + mobile)

## Folder philosophy
We follow domain oriented structure:
- sections/<domain>/view  → UI pages and related components
- app/api/<domain>        → backend API endpoints
- services/<domain>       → business logic
- types/<domain>.ts       → shared domain types
- validation/<domain>.ts  → validation rules

Example modules:
- meters
- buildings
- readings
- billing
- accounts

## API conventions
- REST-like routes using Next.js app/api
- GET list / GET details / POST / PUT / DELETE
- JSON only
- always return { success, data?, error? }

## Code style rules
- Use function components
- Use absolute imports from `src/`
- No default exports (only named exports)
- One file per component or use folder structure
- Type everything (never use any)

## Agent tasks
When creating new code, ALWAYS:
1. place UI in `sections/<domain>/view`
2. place route handlers in `app/api/<domain>`
3. place domain logic in `services/<domain>Service.ts`
4. place types in `types/<domain>.ts`
5. create form validation in `validation/<domain>.ts`

## Auth
JWT-based authentication.
Pages under `(protected)` require auth guard.

## Languages
Primary language is English.
Serbian localization will be added later.

## Goals for the agent
- scaffold CRUD modules
- generate domain types
- generate REST endpoints
- generate UI (list/create/edit/detail)
- ensure imports, paths and structure follow rules above

## Plan status legend (use in all plan documents)
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## DO NOT:
- add fancy UI components that aren't needed
- add icons, illustrations, analytics, charts unless asked
- change layout structure
- install new libraries without confirmation
