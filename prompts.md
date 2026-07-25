# 💡 InnerVoice AI Development Prompt Playbook

This document contains structured, engineering-grade prompts designed to recreate or extend the primary features of the **InnerVoice** codebase. If you are pair programming with an AI agent, you can feed these prompts directly to implement these components.

---

## 📑 Prompt Directory

1. [Phase 1: Database & Express/MySQL CRUD](#1-phase-1-database--expressmysql-crud)
2. [Phase 2: Note Locking & Session Unlocks](#2-phase-2-note-locking--session-unlocks)
3. [Phase 3: Liquid Glass UI & Viscous Mouse Glare](#3-phase-3-liquid-glass-ui--viscous-mouse-glare)
4. [Phase 4: Advanced Search & Dynamic Tags](#4-phase-4-advanced-search--dynamic-tags)
5. [Phase 5: Balanced Profile & Multi-Format Data Backup](#5-phase-5-balanced-profile--multi-format-data-backup)
6. [Phase 6: Note Password Recovery Flow](#6-phase-6-note-password-recovery-flow)

---

### 1. Phase 1: Database & Express/MySQL CRUD
> **Goal**: Set up a modular Express.js server connected to MySQL via connection pools, with security schemas and CRUD controllers.

```markdown
Build a Node.js/Express backend connected to a MySQL database using `mysql2/promise` pool connection.
- Enable ES imports (`"type": "module"`).
- Configure a standard `.env` parser for DB credentials (host, user, password, port, database).
- Create a `users` table:
  - id (auto-increment INT PK)
  - full_name (VARCHAR)
  - email (VARCHAR unique)
  - password (VARCHAR hashed using bcryptjs)
- Create a `notes` table:
  - id (auto-increment INT PK)
  - user_id (INT FK referencing users.id)
  - title (VARCHAR)
  - content (TEXT)
  - category (VARCHAR, default 'General')
  - feeling (VARCHAR, default 'Neutral')
- Build routes and controllers for:
  - Auth: Register (hashed pass) and Login (returns 7-day JWT token).
  - Notes: Create, Read (retrieve logged-in user's entries), Update, and Delete.
- Include express json parser middleware and basic CORS configuration.
```

---

### 2. Phase 2: Note Locking & Session Unlocks
> **Goal**: Create a secure double-lock system supporting user-level PINs, specific note passwords, and session-only memory.

```markdown
Extend our existing Express/MySQL and React notes system to support security locks on individual entries:
1. Backend database additions:
   - Add a nullable `vault_pin` (hashed) column to the `users` table.
   - Add nullable `security_type` (VARCHAR), `note_password` (hashed), and `password_hint` (VARCHAR) columns to the `notes` table.
   - Add an `is_locked` (TINYINT/BOOLEAN) flag to the `notes` table.
2. Unlocking mechanics:
   - If a note is locked (`is_locked = 1`) and has no custom password, verify inputs against the user's hashed `vault_pin`.
   - If a note has `security_type = 'custom_password'`, verify inputs against `notes.note_password`.
3. Session memory (Frontend):
   - When a user unlocks a note, do NOT change `is_locked = 0` in the database.
   - Instead, maintain a `sessionUnlockedIds` state (using a Set or object) in the React Dashboard context.
   - Keep notes visually unlocked only for the duration of the current tab session.
4. UI Forms:
   - Build modals for: Setting Vault PIN, Setting Note Password, and Verifying passwords/PINs to unlock note content.
```

---

### 3. Phase 3: Liquid Glass UI & Viscous Mouse Glare
> **Goal**: Construct the premium glassmorphism styling, server-injected colors, and LERP-smoothed cursor reflections.

```markdown
Create a premium "Liquid Glass" theme engine for our React SPA and Express backend:
1. Backend endpoint:
   - Create a `GET /api/glass-theme` returning a JSON payload of hex values for Light and Dark modes.
   - Define: `primary`, `secondary`, `accent`, `glassBg` (rgba), `glassBorder` (rgba), and `glassInset` box shadow rules.
2. CSS Styling (Tailwind v4):
   - Create Tailwind classes for `.glass-card` using backdrop-blur, variable backdrops, and borders.
3. Glare Tracker Context & Hook:
   - Write a `LiquidGlassProvider` that fetches theme settings from the server on load and injects them onto the `<html>` document `:root` as CSS variables (`--glass-primary`, etc.).
   - Write a `useLiquidGlare` hook that tracks cursor movements.
   - Run a requestAnimationFrame loop that smooths the coordinates (x, y) using linear interpolation (LERP factor 0.06).
   - Dynamically paint a radial gradient circle overlay onto a fullscreen absolute overlay div using CSS custom properties.
```

---

### 4. Phase 4: Advanced Search & Dynamic Tags
> **Goal**: Implement high-performance client-side fuzzy filtering, feeling aggregations, and automatic hashtag extraction.

```markdown
Implement a comprehensive client-side notes search and filtering dashboard in React:
- Extract `#hashtags` dynamically from note body content during index rendering.
- Create filter controls for:
  - Fuzzy text matching across titles and note contents.
  - Feeling tags (Neutral, Happy, Energetic, Sad, etc.).
  - Extracted unique hashtags list (clicking a hashtag filters notes containing it).
  - Date-range constraints (start date and end date boundaries).
- Implement a Sidebar toggle to filter only "Favorite" notes by pushing an `?filter=favorites` query parameter into the URL search params.
```

---

### 5. Phase 5: Balanced Profile & Multi-Format Data Backup
> **Goal**: Restructure settings layout, sync avatar changes instantly, and compile journals into zip backups.

```markdown
Refactor the user profile settings dashboard and support file backups:
1. UI Restructure:
   - Arrange the profile page layout into 3 balanced grid columns.
   - Split controls into separate modular glass cards: Personal Information Form, Change Password Form, and Vault Security PIN Configuration.
2. Reactive Avatars:
   - Upload avatar images to Cloudinary via a buffer stream upload controller.
   - Save the returned avatar URL to localStorage on success.
   - Dispatch a custom `'storage'` event to instantly synchronize and update the profile image shown in the global Header and Sidebar components without requiring page refreshes.
3. Data Portability:
   - Write a utility on the client that queries all user notes.
   - Compile notes list into:
     - A structured JSON format.
     - Individual Markdown files grouped in a zip folder.
   - Offer direct browser download triggers for backups.
```

---

### 6. Phase 6: Note Password Recovery Flow
> **Goal**: Build a secure recovery mechanism to reset lost note-specific passwords using main account authentication credentials.

```markdown
Implement a security recovery pipeline for locked note-specific passwords:
1. Backend recovery endpoint:
   - Create a route `PUT /api/notes/:id/reset-password`.
   - The body accepts: `accountPassword` (the user's main login password), `newNotePassword` (the new note password to set), and an optional `hint`.
2. Execution steps:
   - Fetch the user's primary login hash from the `users` table.
   - Compare the input `accountPassword` against this hash using bcrypt.
   - If verified, hash the `newNotePassword` and save it to the note's `note_password` column. Set `security_type = 'custom_password'` and `is_locked = 1`.
3. Frontend integration:
   - Add a "Forgot Password?" button to the note unlock modal.
   - Open a recovery modal where the user inputs their login password and configures a new password for that specific note.
```
