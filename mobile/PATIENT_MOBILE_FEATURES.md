# SmartCoIHA - Patient Mobile App Features

This document outlines all features to be implemented for the patient-facing mobile app (Flutter). Each section clearly states what is **new backend work** vs **mobile implementation**.

---

## 1. Authentication & Onboarding

### 1.1 First-Time Onboarding (Email Deep Link)

When an institution enrolls a patient, the backend sends a welcome email. This email must now contain a **deep link** that opens the mobile app and pre-fills the patient's identity.

**Deep Link Format:** `smartcoiha://onboard?patientId={InstitutePatientId}&institutionId={InstitutionId}`

**Flow:**
1. Institution registers patient (existing).
2. Backend sends welcome email containing the deep link (modification needed).
3. Patient clicks link on their phone → app opens with `patientId` and `institutionId` pre-filled.
4. App prompts the patient to **enter their email address** for verification.
5. App calls backend to verify the email matches the patient record.
6. On success, app navigates to the **Fingerprint Enrollment** screen.
7. Patient identity (`patientId`, `institutionId`, `patientGuid`) is cached locally in secure storage for future logins.

#### Backend (New / Modified)

| Task | Detail |
|------|--------|
| **Modify welcome email template** | Update the HTML email body in `PatientService.RegisterPatientAsync()` and `BulkUploadPatientsAsync()` to include the deep link: `smartcoiha://onboard?patientId={InstitutePatientId}&institutionId={InstitutionId}` |
| **New endpoint: Verify patient email** | `POST /api/patients/verify-identity` — Accepts `{ institutePatientId, institutionId, email }`. Returns the patient record if the email matches, or 401 if not. This is the patient's first authentication step. |

#### Mobile

| Task | Detail |
|------|--------|
| **Deep link handling** | Register `smartcoiha://` URI scheme on both Android and iOS. Parse `patientId` and `institutionId` from the URL parameters. |
| **Onboarding screen** | Show pre-filled patient ID and institution. Prompt user to enter their email. Call verify-identity endpoint. |
| **Secure local storage** | On successful verification, cache `patientId`, `institutionId`, `patientGuid`, and `email` using `flutter_secure_storage` (encrypted keychain/keystore). |

---

### 1.2 Returning Patient Login

When the patient opens the app again after initial onboarding:

**Flow (cached data exists):**
1. App reads cached identity from secure storage.
2. App prompts for **fingerprint verification** (biometric match against enrolled template).
3. On success → navigate to Home.

**Flow (no cached data — e.g., new device, cleared storage):**
1. App shows a manual identification screen.
2. Patient selects their **institution** from a dropdown list.
3. Patient enters their **Institute Patient ID**.
4. Patient provides **fingerprint** for verification.
5. On success → cache identity in secure storage → navigate to Home.

#### Backend (New)

| Task | Detail |
|------|--------|
| **New endpoint: Patient login** | `POST /api/patients/login` — Accepts `{ institutePatientId, institutionId, fingerprintTemplate }`. Verifies the fingerprint against the stored hash. Returns a **patient JWT token** (new token type with claims: `patientId`, `institutionId`, `institutePatientId`, role: `Patient`) on success. |
| **Patient JWT token generation** | Extend the auth system to issue tokens for patients (not just institution managers). Include patient-specific claims. |
| **Update institution list endpoint auth** | `GET /api/Institutions/verified` already exists and returns `{ id, name }` for all verified institutions. Currently restricted to `InstitutionManager` role — update authorization to also allow unauthenticated or patient-role access, since patients need this on the manual login screen before they have a token. |
| **Patient authorization attribute** | Create `RequirePatientAttribute` (similar to `RequireInstitutionManagerAttribute`) to protect patient-specific endpoints. Validates Patient role in JWT. |

#### Mobile

| Task | Detail |
|------|--------|
| **Auto-login check** | On app start, check secure storage for cached identity. If present, go to fingerprint screen. If absent, go to manual login. |
| **Manual login screen** | Institution dropdown (fetched from API) + Institute Patient ID text field + fingerprint capture. |
| **Token management** | Store JWT token in secure storage. Attach to all subsequent API requests via `Authorization: Bearer` header. Handle token expiry and re-authentication. |

---

### 1.3 Fingerprint Enrollment

After first-time email verification, the patient must enroll their fingerprint.

#### Recommended Secure Fingerprint Approach

The current backend accepts a raw fingerprint template string, hashes it with SHA-256, and stores it. For the mobile side, this is the recommended secure approach:

**Option: Server-Side Template Matching (Recommended)**

Use a dedicated fingerprint SDK that captures a **minutiae-based template** from the device sensor, then send it to the backend for storage/matching.

| Layer | Approach |
|-------|----------|
| **Capture** | Use a fingerprint SDK that provides raw template extraction (not just OS-level biometric pass/fail). Options: **Veridium**, **Innovatrics**, **Neurotechnology MegaMatcher**, or **SecuGen** — these provide Flutter/native plugins that output standardized fingerprint templates (ISO 19794-2 or proprietary). |
| **Transport** | Transmit the template over **HTTPS/TLS** only. Never log or cache the template on device. Consider encrypting the template payload with a per-session key before sending (envelope encryption). |
| **Storage** | Backend already hashes with SHA-256 + patient ID salt. **Upgrade recommendation:** Use PBKDF2 or Argon2 instead of plain SHA-256 for template hashing — these are resistant to brute-force attacks. |
| **Verification** | On each fingerprint action, capture a fresh template on device → send to backend → backend hashes and compares against stored hash. All matching happens server-side. |
| **Fallback** | If the device lacks a fingerprint sensor or SDK integration, the patient must visit the institution to enroll via an institution-provided device. The app should detect sensor availability and inform the user. |

**Why not `local_auth`?** Flutter's `local_auth` only provides a boolean pass/fail using the OS biometric system. It does **not** expose the fingerprint template data, which the backend needs for cross-device server-side matching. `local_auth` can be used as an **additional layer** for app-unlock convenience, but cannot replace the template-based enrollment/verification the system requires.

#### Backend (Existing)

| Task | Detail |
|------|--------|
| Endpoint exists | `POST /api/patients/fingerprint` — accepts `{ patientId, fingerprintTemplate }`. Hashes and stores. |
| **Recommended upgrade** | Replace SHA-256 hashing with **PBKDF2** or **Argon2** for template storage. Update `HashFingerprintTemplate()` and `VerifyFingerprintTemplate()` in `PatientService.cs`. |

#### Mobile

| Task | Detail |
|------|--------|
| **Fingerprint SDK integration** | Integrate a fingerprint capture SDK that outputs template data (not just boolean auth). |
| **Enrollment screen** | Guide user through fingerprint capture (multiple scans for quality). Show progress and success/failure feedback. |
| **Sensor detection** | Check device capabilities on launch. Show appropriate messaging if no compatible sensor found. |
| **Template handling** | Never persist template to disk. Hold in memory only during capture → API call → discard. |

---

## 2. Patient Profile

A screen for the patient to view their profile details.

#### Backend (Existing + New)

| Task | Detail |
|------|--------|
| Endpoint exists | `GET /api/patients/{id}` — returns patient details. |
| **Secure with patient auth** | Protect this endpoint with the new `RequirePatientAttribute`. Ensure a patient can only access their own profile (match JWT `patientId` claim against the `{id}` parameter). |

#### Mobile

| Task | Detail |
|------|--------|
| **Profile screen** | Display: Name, Email, Institution Name, Institute Patient ID, Enrollment Status (Verified / Pending). Read-only. |

---

## 3. Data Request History

Patients need a single, unified view of **all data requests involving their records** — not split into incoming/outgoing (that's the institution's view). This shows the patient what has happened and is happening with their data.

#### Backend (New)

| Task | Detail |
|------|--------|
| **New endpoint: Patient data request history** | `GET /api/datarequest/patient/{institutePatientId}/history` — Returns all data requests where `InstitutePatientId` matches, ordered by `RequestedTimestamp` descending. Protected by `RequirePatientAttribute`. |
| **Response DTO** | `PatientDataRequestHistoryDto`: `requestId`, `requestingInstitutionName`, `resourceType`, `requestedTimestamp`, `expiryTimestamp`, `institutionApprovalStatus`, `patientApproved` (bool from `FingerprintValidationSuccess`), `isExpired`, `status` (computed: see below). |
| **Computed status field** | A human-readable status derived from the request state: `"Awaiting Institution Review"`, `"Awaiting Your Approval"`, `"Approved & Shared"`, `"Denied by Institution"`, `"Expired"`. This simplifies mobile display logic. |

#### Mobile

| Task | Detail |
|------|--------|
| **Data Request History screen** | List of all requests involving the patient's data. Each card shows: requesting institution, resource type, date, and current status with color-coded badge. |
| **Status filters** | Filter by: All, Pending, Approved, Denied, Expired. |
| **Pull-to-refresh** | Refresh the list on pull gesture. |
| **Tap to act** | If a request is in "Awaiting Your Approval" state, tapping it navigates to the Fingerprint Approval screen. |

---

## 4. Fingerprint Approval for Data Requests

A dedicated screen for the patient to approve a data request by providing their fingerprint. This is separate from enrollment — it's a per-request consent action.

#### Backend (Existing)

| Task | Detail |
|------|--------|
| Endpoint exists | `POST /api/datarequest/{requestId}/verify-fingerprint/{institutePatientId}` — accepts `{ fingerprintTemplate }`, verifies against stored hash, grants data access on match. |
| **Secure with patient auth** | Protect with `RequirePatientAttribute`. Ensure the patient can only approve requests for their own records. |

#### Mobile

| Task | Detail |
|------|--------|
| **Approval screen** | Shows request details: requesting institution, resource type, requested date, time remaining before expiry. |
| **Consent prompt** | Clear message: *"[Institution Name] is requesting access to your [Resource Type] records. Place your finger on the sensor to approve."* |
| **Fingerprint capture** | Capture template using the fingerprint SDK → send to backend verification endpoint → show result. |
| **Success state** | Show confirmation: *"Access approved. Your [Resource Type] data has been shared with [Institution]."* Navigate back to history. |
| **Failure state** | Show error with retry option. After 3 failed attempts, lock for 30 seconds (client-side rate limiting). |
| **Expiry guard** | If the request has expired, show a message and disable the fingerprint action. Check expiry both from cached data and via API before attempting verification. |

---

## 5. Notifications

Notifications inform the patient about **every stage** of what happens to their data — full transparency into the data request lifecycle.

#### Backend (New)

| Task | Detail |
|------|--------|
| **New: Push notification service** | Integrate **Firebase Cloud Messaging (FCM)**. Store patient device tokens in the database. |
| **New endpoint: Register device token** | `POST /api/patients/device-token` — Accepts `{ patientId, deviceToken, platform }`. Stores/updates the FCM token for push delivery. Protected by `RequirePatientAttribute`. |
| **New endpoint: Get patient notifications** | `GET /api/notifications/patient/{patientId}` — Returns notification history for the patient, ordered by timestamp descending. Protected by `RequirePatientAttribute`. |
| **New endpoint: Mark notification read** | `PUT /api/notifications/{notificationId}/read` — Marks a notification as read. |
| **New: Notification entity** | `Notification` table: `Id`, `PatientId`, `Title`, `Message`, `Type` (enum), `IsRead`, `CreatedAt`, `DataRequestId` (nullable FK for linking to request). |
| **Trigger notifications at each lifecycle event** | Send push + persist notification when: |
| | - A new data request is created for the patient's records → *"[Institution] has requested access to your [Resource Type] records."* |
| | - Institution approves the request → *"[Institution]'s request for your [Resource Type] has been approved by your institution. Your fingerprint is needed to complete the process."* |
| | - Institution denies the request → *"The request for your [Resource Type] by [Institution] has been denied by your institution."* |
| | - Patient approves via fingerprint → *"You have approved access to your [Resource Type] for [Institution]."* |
| | - Request expires without completion → *"The request for your [Resource Type] by [Institution] has expired."* |

#### Mobile

| Task | Detail |
|------|--------|
| **FCM integration** | Use `firebase_messaging` plugin. Request notification permissions on onboarding. Register device token with backend after login. |
| **Notification screen** | List all notifications with unread indicator. Grouped by date. |
| **Tap action** | Tapping a notification navigates to the relevant data request detail or approval screen. |
| **Unread badge** | Show unread count on the notification icon in the bottom navigation bar. |
| **Background notifications** | Handle notifications received while app is in background/terminated — show system notification, deep link to relevant screen on tap. |

---

## 6. Screens Summary

| # | Screen | Description |
|---|--------|-------------|
| 1 | **Splash** | App branding, check auth state, route to appropriate screen |
| 2 | **Onboarding Intro** | Brief explanation of the app's purpose and consent flow (first install only) |
| 3 | **Email Verification** | Deep link landing — patient enters email to verify identity (first time) |
| 4 | **Fingerprint Enrollment** | Capture and register biometric fingerprint template (first time) |
| 5 | **Manual Login** | Select institution + enter patient ID + fingerprint (returning user, no cache) |
| 6 | **Fingerprint Login** | Quick fingerprint scan for returning users with cached identity |
| 7 | **Home / Dashboard** | Pending requests count, recent activity summary, quick action to approve |
| 8 | **Profile** | Patient details — name, email, institution, enrollment status |
| 9 | **Data Request History** | All data requests involving the patient, with status filters |
| 10 | **Fingerprint Approval** | Dedicated screen to review and approve a data request via fingerprint |
| 11 | **Notifications** | Full notification history of data lifecycle events |
| 12 | **Settings** | App preferences, re-enroll fingerprint, clear cache, about |

---

## 7. New Backend Endpoints Summary

These endpoints need to be **created or modified** on the backend:

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/patients/verify-identity` | Verify patient email during onboarding | **New** |
| POST | `/api/patients/login` | Patient login with fingerprint, returns patient JWT | **New** |
| GET | `/api/Institutions/verified` | List verified institutions for dropdown | **Existing** — currently requires `InstitutionManager` role; needs auth updated to also allow unauthenticated/patient access |
| GET | `/api/datarequest/patient/{institutePatientId}/history` | Patient's unified data request history | **New** |
| POST | `/api/patients/device-token` | Register FCM push notification token | **New** |
| GET | `/api/notifications/patient/{patientId}` | Get patient notification history | **New** |
| PUT | `/api/notifications/{notificationId}/read` | Mark notification as read | **New** |
| — | Welcome email template | Add deep link to existing registration email | **Modified** |
| — | Patient JWT token generation | New token type with Patient role | **New** |
| — | `RequirePatientAttribute` | Authorization attribute for patient endpoints | **New** |
| — | `Notification` entity + migration | New database table for notifications | **New** |
| — | FCM push notification service | Firebase integration for sending push notifications | **New** |
| — | Notification triggers in `DataRequestService` | Fire notifications at each data request lifecycle event | **New** |

---

## 8. Existing Backend Endpoints Used (No Changes)

| Method | Endpoint | Used For |
|--------|----------|----------|
| GET | `/api/patients/{id}` | Patient profile (add patient auth guard) |
| POST | `/api/patients/fingerprint` | Fingerprint enrollment |
| POST | `/api/datarequest/{requestId}/verify-fingerprint/{institutePatientId}` | Approve data request (add patient auth guard) |

---

## 9. Key Technical Considerations

### Security
- **Fingerprint templates** must never be stored on the device. Capture → transmit over TLS → discard from memory immediately.
- **Secure storage** (`flutter_secure_storage`) for cached patient identity — uses Android Keystore / iOS Keychain under the hood.
- **Patient JWT tokens** should have a shorter expiry (e.g., 7 days) with refresh token support, since patients use mobile devices.
- **Rate limiting** on fingerprint verification endpoints to prevent brute-force template guessing.
- **Certificate pinning** in the mobile app to prevent MITM attacks on fingerprint template transmission.

### Mobile Architecture
- **State management:** Riverpod or Bloc for managing auth state, request lists, notifications.
- **Offline handling:** Show cached data request history when offline. Queue notification reads. Show clear offline indicator.
- **Deep linking:** Use `app_links` (Android) and Universal Links (iOS) for the email deep link. Register `smartcoiha://` custom scheme as fallback.

### Privacy
- **No health data on device.** The patient mobile app does **not** access or display FHIR health records. Patients only see metadata (which institution requested what type of data, and the status).
- **No local data caching** beyond identity credentials and notification state.
