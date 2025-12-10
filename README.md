# Water Meter System

A municipal water meter management system.  
Includes web dashboard (Next.js) and mobile application (Expo) for collecting water meter readings onsite.

## Modules
- Buildings
- Meters
- Readings
- Billing / Invoice generation
- Accounts / Users

## Apps
### wm-web
- Next.js 15 (app router)
- Backend + frontend in one project
- REST endpoints in `/app/api/*`
- MUI UI
- Domain-oriented folder structure

### wm-mobile
- React Native (Expo)
- Onsite readings
- Offline mode (planned)
- Sync with backend API

## Project structure
water-meter/
├── docs/
├── wm-web/
└── wm-mobile/

## Requirements
- Node 18+ (web)
- Expo CLI (mobile)
- MySQL (local or remote)

## Run web
cd wm-web
npm install
npm run dev

## Status
🚧 Work in progress. First step: define domain models and CRUD.
