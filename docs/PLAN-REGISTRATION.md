# Registration Implementation Plan

## Tasks
1. `[d]` Define account model fields and validation rules for consumers and staff (name, contact, address, household size, role, verification status, timestamps).
2. `[d]` Implement backend registration endpoints for consumers and staff (create unverified accounts, prevent duplicates, return clear duplication message).
3. `[d]` Implement backend verification actions for back-office (approve/reject consumers and staff; audit trail; status transitions).
4. `[d]` Add mobile flows: consumer registration screen, staff registration screen, client-side validation, duplicate-account messaging, and submission to backend.
5. `[d]` Add web back-office screens: list pending/verified accounts, verify/reject actions, detail view.
6. `[d]` Authentication hooks: issue JWT on registration/login-ready flow, enforce verification checks before allowing readings submission.
7. `[d]` Tests: unit/integration for validation, endpoints, and UI flows (happy path, duplicate, missing data, unverified access).
