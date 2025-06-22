# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created `changelog.md` to track project updates.
- Added instructions in `README.md` to update `changelog.md` after every successful change.
- User Dashboard: Added "Change Password" functionality for users who signed up with email/password.
    - New UI section in `UserDashboardPage.tsx`.
    - New `changePassword` service in `authService.ts`.
    - New `/api/auth/change-password` endpoint in `server/main.js`.

### Changed
- `README.md`: Renamed internal changelog section to "Recent Updates (from README)".

### Fixed
- Corrected `LoadingSpinner` rendering in `UserDashboardPage.tsx` from `<LoadingSpinner />` to `{LoadingSpinner}` as it's a ReactNode.
