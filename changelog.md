# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **User Dashboard (`pages/UserDashboardPage.tsx`):**
    - Added a "Set/Reset Password via Email" button for Google-linked users who do not have a local password. This button appears with the guidance message and navigates to the password reset request page, providing a clearer call to action.
- Corrected `LoadingSpinner` rendering in `UserDashboardPage.tsx` from `<LoadingSpinner />` to `{LoadingSpinner}` as it's a ReactNode.

### Added
- Created `changelog.md` to track project updates.
- Added instructions in `README.md` to update `changelog.md` after every successful change.
- User Dashboard: Added "Change Password" functionality for users who signed up with email/password.
    - New UI section in `UserDashboardPage.tsx`.
    - New `changePassword` service in `authService.ts`.
    - New `/api/auth/change-password` endpoint in `server/main.js`.

### Changed
- `README.md`: Renamed internal changelog section to "Recent Updates (from README)".
- **Authentication Logic (`server/main.js`):**
    - Enhanced `/api/auth/login` to guide users who signed up via Google (and have no local password) to use Google Sign-In or "Forgot Password?" if they try email/password login.
    - `sanitizeUserForResponse` now includes a `hasLocalPassword` boolean flag, indicating if a password hash exists for the user.
- **User Interface (`App.tsx`, `pages/UserDashboardPage.tsx`):**
    - `User` type in `App.tsx` now includes `hasLocalPassword`.
    - Login success and session restoration in `App.tsx` correctly handle `hasLocalPassword`.
    - `UserDashboardPage.tsx` now uses `hasLocalPassword` to determine if the "Change Password" section should be available. This allows users who signed up with Google but later set a password (e.g., via "Forgot Password") to change that password.
    - The message in `UserDashboardPage.tsx` for Google users without a local password was updated and the "Set/Reset Password via Email" button was added for better UX.
