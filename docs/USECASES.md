## Register Use Case

- **Primary actors**: Consumer (citizen household), Utility Staff (back-office), Utility Field Staff.
- **Goal**: Capture accounts (consumers and staff) with verified identities so they can submit or perform meter readings.
- **Preconditions**: Mobile app installed; backend reachable; required personal data available.
- **Triggers**: New consumer installs the mobile app; new utility staff member onboards; first-time access to web back-office.

### Main Flow — Consumer Registration & Verification
1. Consumer opens mobile app and selects **Register**.
2. Consumer enters first name, last name, address, household size, email/phone, and password.
3. System validates input client-side; sends registration payload to backend.
4. Backend stores user as **Consumer (unverified)** and returns success.
5. Back-office Utility Staff reviews new consumer in web app and verifies identity (manual review).
6. System marks user as **Verified Consumer** and enables monthly meter submission.

### Main Flow — Utility Staff Registration & Verification
1. Staff member opens mobile app and selects **Register as Staff**.
2. Staff enters name, email/phone, password, and selects role (field staff or back-office).
3. System validates input client-side; sends registration payload to backend.
4. Backend stores user as **Staff (pending verification)** and returns success.
5. Back-office admin verifies staff member in web app.
6. System marks staff as **Verified Staff**; role defines permissions (field: capture readings; back-office: approve/verify).

### Alternate / Edge Flows
- **Invalid data**: Client shows field errors; no account created.
- **Duplicate email/phone**: Backend rejects; client shows duplication message.
- **Offline registration attempt**: Client stores request locally and prompts user to retry when online (deferred, not implemented now).
- **Consumer already registered on another device**: Backend detects existing account (by email/phone); app informs the user the account exists and only prompts for confirmation/sign-in instead of creating a new consumer record.

### Postconditions
- Verified consumers can submit monthly meter readings via mobile (including photo-based readings).
- Verified field staff can record readings onsite; verified back-office staff can approve consumers and manage accounts.

### Data captured
- Consumer: first name, last name, address, household size, email/phone, password, verification status.
- Staff: name, email/phone, password, role (field/back-office), verification status.

## Meter lifecycle workflow

### Goal
Ensure meters follow a controlled lifecycle from purchase to installation and removal, with clear responsibility by role.

### Main Flow — Purchase → Install → Remove
1. Back-office staff purchases and registers a new meter (serial number, address, group, etc.).
2. System stores the meter as **Inactive**.
3. Field staff installs the meter onsite and confirms the address using the mobile app.
4. System updates the meter status to **Active**.
5. Field staff later removes or replaces the meter (e.g., upgrade, malfunction).
6. System updates the meter status to **Removed**.

### Notes
- A property should not be left without a meter; removal is typically paired with replacement.
- Address confirmation happens at installation time by field staff.
