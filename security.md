# 🔒 InnerVoice Security Architecture

This document describes the security protocols, encryption mechanisms, authentication flows, and data boundary configurations implemented in **InnerVoice**.

---

## 🔑 Authentication & Authorization

### JWT Session Validation
- Users authenticate via the `/api/auth/login` endpoint, which issues a signed **JSON Web Token (JWT)** valid for 7 days.
- The payload includes user details (e.g. `id`, `email`, `role`).
- The JWT is transmitted by the client in the `Authorization: Bearer <token>` HTTP header.
- Endpoint validation is enforced by [authMiddleware.js](file:///c:/Users/ajeet/Desktop/Proj1/InnerVoice/server/middleware/authMiddleware.js), which rejects expired, unsigned, or malformed tokens.

### Role-Based Access Control (RBAC)
- Admin-specific routes (e.g., `/api/admin/*`) are double-guarded by [adminMiddleware.js](file:///c:/Users/ajeet/Desktop/Proj1/InnerVoice/server/middleware/adminMiddleware.js).
- This middleware validates that `req.user.role === 'admin'`. Unauthorized requests receive a `403 Forbidden` JSON response.

---

## 💾 Data Isolation & Multi-Tenancy

To prevent **Horizontal Privilege Escalation** (users accessing other users' notes by altering IDs in HTTP requests), all database transactions strictly isolate queries based on the authenticated session context:

```sql
-- All CRUD operations explicitly bound to session id
SELECT * FROM notes WHERE id = ? AND user_id = ?
UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?
DELETE FROM notes WHERE id = ? AND user_id = ?
```

There are **no queries** targeting entries solely by their resource primary key (`id`) without a corresponding check on the authenticated `user_id`.

---

## 🔐 Cryptography & Hashing

All cryptography actions use `bcryptjs` for secure key derivation and comparison.

### 1. User Login Passwords
- Stored as hashed values (`users.password`) using bcrypt with **10 salt rounds**.
- Plaintext passwords are never logged, stored in cache, or returned by API responses.

### 2. Vault PINs
- Users can lock notes under a global 4-digit PIN.
- The PIN is hashed and saved in `users.vault_pin` using bcrypt (10 rounds).

### 3. Note-Specific Passwords
- Individual notes can have unique custom override passwords.
- Note passwords are saved in `notes.note_password` as independent bcrypt hashes.

---

## 🚪 Vault Unlocking & Memory Isolation

### Session-Only Memory Unlocks
To mitigate **cache sniffing** and session stealing on shared machines:
- Verification queries (`/api/notes/:id/verify-password` or `/api/auth/verify-vault-pin`) return a simple confirmation payload. They **do not** write changes to the note record in the database.
- The React client tracks unlocked state locally in a React state `sessionUnlockedIds` (a memory Set).
- Refreshing the browser, closing the tab, or logging out clears the Set, immediately relocking all notes without leaking decrypted state.

### Ownership Recovery Flow
If a user forgets their note-specific password or vault PIN, a recovery flow is available:
1. The user must provide their primary account login password.
2. The server calls `bcrypt.compare` on the main account login hash (`users.password`).
3. Only upon successful confirmation will the server overwrite the target `note_password` with a new custom password, preventing any backdoor access.

---

## 🌐 Network & Upload Boundaries

### CORS Whitelists
The Express app configures CORS to restrict incoming requests:
- Allowed origins are restricted to `http://localhost:5173` and `http://127.0.0.1:5173`.
- `credentials: true` is configured to authorize session headers.

### File Upload Sandboxing
- Image uploads (for user avatars) use `multer` with memory storage buffers.
- Uploaded files are streamed via `streamifier` directly to Cloudinary's CDN.
- Images are never stored in a public temp folder on the server disk, eliminating directory traversal risks and remote code execution (RCE) via malicious script injection.
