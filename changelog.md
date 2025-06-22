
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Credit System for CV Generation**:
    - Each Gemini API call for CV generation costs 5 credits.
    - **Registered Users**:
        - Receive 50 free credits daily.
        - Database `users` table updated with `credits_available` and `credits_last_reset_date` columns.
        - Backend logic in `userService.js` to initialize, reset, check, and decrement credits.
        - `/api/cv/generate` route now checks and updates credits for registered users.
        - User's available credits are displayed on the Hero section and User Dashboard.
    - **Unregistered Users**:
        - Receive 5 free credits daily, tracked via browser `localStorage`.
        - Hero section displays remaining free CV generations and disables generation if credits are depleted.
    - Updated `User` type and `App.tsx` to manage credit-related fields in global state.
    - Added credit constants (`GEMINI_CALL_COST`, `DEFAULT_CREDITS_REGISTERED`, `DEFAULT_CREDITS_UNREGISTERED`) to `constants.tsx`.
    - `geminiService.ts` updated to pass `userId` to the backend for credit checking.
- **Major Codebase Modularization**:
    - **Frontend**:
        - Centralized all shared TypeScript interfaces (User, WorkExperience, etc.) into `src/types/index.ts`.
        - Updated all frontend components and services to import types from `src/types/index.ts`.
    - **Backend (`server/`)**:
        - Refactored the monolithic `server/main.js` into a modular structure:
            - `server/config/`: For database, mailer, analytics, and app configurations.
            - `server/routes/`: For API route definitions (auth, CV, analytics).
            - `server/services/`: For business logic (user service, email service, AI service, analytics service, internal auth orchestrator).
            - `server/utils/`: For utility functions (sanitizeUser, tokenUtils).
        - `server/main.js` now serves as the main orchestrator, setting up Express, middleware, and mounting the modular routes.
- Created `changelog.md` to track project updates.
- User Dashboard: Added "Change Password" functionality for users who signed up with email/password.
    - New UI section in `UserDashboardPage.tsx`.
    - New `changePassword` service in `authService.ts`.
    - New `/api/auth/change-password` endpoint in `server/routes/authRoutes.js`.

### Changed
- `README.md`: Renamed internal changelog section. Added "Project Structure" and "Codebase Management" guidelines.
- **Authentication Logic (Backend)**:
    - Enhanced `/api/auth/login` to guide Google-first users appropriately.
    - `sanitizeUserForResponse` utility now includes a `hasLocalPassword` flag and credit system fields.
- **User Interface (`App.tsx`, `pages/UserDashboardPage.tsx`)**:
    - `User` type (now in `src/types/index.ts`) includes `hasLocalPassword` and credit system fields.
    - Login success and session restoration handle `hasLocalPassword` and credit system fields.
    - `UserDashboardPage.tsx` uses `hasLocalPassword` for "Change Password" section visibility and provides better guidance for Google users.

### Fixed
- **User Dashboard (`pages/UserDashboardPage.tsx`):**
    - Added a "Set/Reset Password via Email" button for Google-linked users who do not have a local password.
- Corrected `LoadingSpinner` rendering in `UserDashboardPage.tsx` from `<LoadingSpinner />` to `{LoadingSpinner}` as it's a ReactNode.
