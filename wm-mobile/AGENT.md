# Water Meter Mobile – Agent Notes

## Purpose
Mobile application is used mainly by field workers to:
- read water meters onsite
- enter periodic readings
- work offline
- sync data when network exists

Primary user: meter inspector (field operator).

## Stack
- React Native / Expo
- TypeScript
- Axios (or fetch)
- Zustand (or context) for state
- Tailwind RN (optional)
- SWR or react-query (optional)

API calls point to wm-web backend routes under `/api/*`.

## FOLDER STRUCTURE (MUST FOLLOW)

app/
  (tabs)           ← navigation only

src/
  api/             ← API layer (axios instance, types, helpers)
  components/      ← layout/ui only
  constants/       ← configs and shared constants
  hooks/           ← custom hooks
  screens/         ← screen modules by domain
    auth/
    home/
  services/        ← business logic
  state/           ← zustand or context stores
  theme/           ← colors, typography
  utils/

## API conventions
- All API routes must map to Next.js backend endpoints.

- Return { success, data?, error? }

- JWT token must be attached to every request (Authorization: Bearer).

## Agent rules (very important)
When writing new code:
1. screens go under `src/screens/<domain>`
2. API calls under `src/api`
3. business logic under `src/services`
4. types under `src/api/types`
5. persistent state under `src/state`
6. UI components under `src/components/ui`

## Authentication
- Mobile and web share JWT tokens
- After login, token stored in AsyncStorage
- Refresh logic is minimal for now

## Offline mode
Handles:
- storing readings locally
- periodic sync
- showing status (synced / pending)

Agent MUST NOT implement offline engine automatically unless requested; only follow existing patterns.

## DO NOT
- create new folder structures
- move screens outside `src/screens`
- install packages without asking
- add fancy UI code unless requested
- add external auth providers

## GOALS FOR THE AGENT
- scaffold screens per domain (TBD)
- handle API calling
- sync with backend
- local persistence of unsent readings
- minimal UI, focus on functionality
