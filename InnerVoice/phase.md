# 🚀 InnerVoice Development Phases & Roadmap

This document outlines the evolutionary phases of **InnerVoice**, tracking completed milestones from the core foundation to advanced security features, premium styling, and outlining future plans.

---

## 🗺️ Phase Roadmap Overview

| Phase | Title | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Core Foundation & Basic Journaling | User Auth & Notes CRUD | `✅ Completed` |
| **Phase 2** | Security, PINs & Vault Controls | Advanced Encryption & Recovery | `✅ Completed` |
| **Phase 3** | Liquid Glass UI System | Glassmorphism, LERP Glare, and Animations | `✅ Completed` |
| **Phase 4** | Search, Filtering & Discovery | Fuzzy searching, Hashtags, and Date Filters | `✅ Completed` |
| **Phase 5** | Profile Refinement & Data Export | Multi-column layout, Reactive Avatars, and Backups | `✅ Completed` |
| **Phase 6** | Rich Content & Cloud Sync | Advanced editor, media embeds, offline journaling | `⏳ Future` |
| **Phase 7** | Deep Insights & NLP | Sentiment analysis, automated summary tags | `⏳ Future` |

---

## 🛠️ Detailed Breakdown of Phases

### 🔹 Phase 1: Core Foundation & Basic Journaling
*Focuses on establishing database communication, basic routing, and fundamental user operations.*

- **Secure JWT Authentication**: Implemented basic signup and login flows using `jsonwebtoken` and `bcryptjs` password hashing.
- **Notes CRUD**: Designed endpoints for creating, reading, updating, and deleting note entries stored in MySQL database.
- **Standard Navigation**: Implemented primary Header and Sidebar components for navigation.

---

### 🔹 Phase 2: Security, PINs & Vault Controls
*Enables fine-grained user privacy and lock controls for personal journal entries.*

- **Vault PIN System**: Users can set a secure vault PIN to lock sensitive entries.
- **Custom Note Passwords**: Option to protect individual notes with specific custom passwords instead of the global PIN.
- **Session-based Unlocking**: Session tracking with a temporary `sessionUnlockedIds` state on the frontend so unlocked notes remain readable only for the duration of the current tab session.
- **Password Recovery**: Implemented a password reset recovery route using the user's primary login credentials to unlock locked notes if they forget their PIN/password.

---

### 🔹 Phase 3: Liquid Glass UI System
*Elevates the interface using premium, modern aesthetics.*

- **Dynamic Theme API (`/api/glass-theme`)**: Served iridescent configurations (primary, secondary, accent, borders) dynamically from the backend.
- **LiquidGlassProvider**: Fetches the theme colors and injects them as custom CSS properties into the HTML `:root`.
- **Lerped Mouse Glare (`useLiquidGlare`)**: Created a mouse glare tracking hook with a linear interpolation (LERP) formula to create a viscous 100ms lag, simulating the glare refraction of thick liquid glass.
- **Mesh Background**: Animated gradient ambient blobs drifting slowly in the background.

---

### 🔹 Phase 4: Search, Filtering & Discovery
*Enhances discovery and categorizations of journal entries.*

- **Fuzzy Search & Match**: Quick keyword matching on titles and content.
- **Feeling & Categorization Filters**: Fast filtering of entries based on feelings (Happy, Sad, Neutral) and categories.
- **Dynamic Hashtags**: Extracting and filtering by inline hashtags (`#journal`, `#ideas`) from note content.
- **Date-Range Filtering**: Restricting matches to specific date boundaries.
- **Favorites Filter**: Dashboard query parameter tracking to display starred entries.

---

### 🔹 Phase 5: Profile Refinement & Data Export
*Polishes profile page settings and secures user data portability.*

- **Three-Column Profile Layout**: Modularized the Profile settings into balanced cards (Personal Info, Password Change, Vault Settings).
- **Reactive Avatars**: Profile picture uploads via Cloudinary. Implemented cross-tab synchronization of avatars using local storage state listeners to update Header and Sidebar avatars instantly.
- **Data Export & Backups**: Allowed users to backup their journal by downloading notes zipped in JSON and Markdown formats.

---

### ⏳ Phase 6: Rich Content & Cloud Sync (Planned)
*Future updates geared towards rich editing capabilities and offline support.*

- **Rich Text / Markdown Editor**: Integrate a rich text editor (e.g., TipTap or Quill) replacing the textarea field.
- **Image & Media Embeds**: Inline image uploading and embedding directly inside the note contents.
- **Offline Journaling**: Service worker caching and local storage synchronization to allow offline creation of notes, which sync up once an internet connection is established.

---

### ⏳ Phase 7: Deep Insights & NLP (Proposed)
*Leveraging backend analysis for journaling trends.*

- **Sentiment Analysis & Analytics**: Graphing emotional trends over time in the Analytics tab based on journal text analysis.
- **AI Automated Summary Tags**: Auto-suggesting tags and highlights based on entries.
