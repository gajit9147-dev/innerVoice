import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import pool from "../../config/db.js";
import env from "../../config/env.js";

describe("Media Routes & SSRF Security Protection", () => {
  let validToken = null;
  let testUserId = null;
  let testNoteId = null;

  beforeAll(async () => {
    const [rows] = await pool.query("SELECT id, email FROM users LIMIT 1");
    if (rows.length > 0) {
      testUserId = rows[0].id;
      validToken = jwt.sign(
        { id: testUserId, email: rows[0].email, role: "user" },
        env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Create a temporary test note for media retrieval
      const [noteResult] = await pool.query(
        "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
        [testUserId, "Test Note For Media", "Note content for testing media"]
      );
      testNoteId = noteResult.insertId;
    }
  });

  afterAll(async () => {
    if (testNoteId) {
      await pool.query("DELETE FROM notes WHERE id = ?", [testNoteId]);
    }
    await pool.end();
  });

  describe("Authentication Requirements", () => {
    test("GET /api/media/music-library should return 401 without auth token", async () => {
      const res = await request(app).get("/api/media/music-library");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("POST /api/media should return 401 without auth token", async () => {
      const res = await request(app).post("/api/media");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("POST /api/media/import-audio should return 401 without auth token", async () => {
      const res = await request(app).post("/api/media/import-audio").send({
        url: "https://example.com/audio.mp3",
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("SSRF Protection on Audio Import", () => {
    test("Should reject localhost URL", async () => {
      if (!validToken) return;
      const res = await request(app)
        .post("/api/media/import-audio")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          url: "http://localhost:5000/secret.mp3",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/local, private, or prohibited/i);
    });

    test("Should reject 127.0.0.1 loopback URL", async () => {
      if (!validToken) return;
      const res = await request(app)
        .post("/api/media/import-audio")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          url: "http://127.0.0.1:8080/audio.mp3",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/local, private, or prohibited/i);
    });

    test("Should reject Cloud metadata IP 169.254.169.254", async () => {
      if (!validToken) return;
      const res = await request(app)
        .post("/api/media/import-audio")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          url: "http://169.254.169.254/latest/meta-data/",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/local, private, or prohibited/i);
    });

    test("Should reject YouTube DRM/streaming platform links safely", async () => {
      if (!validToken) return;
      const res = await request(app)
        .post("/api/media/import-audio")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/video streaming platforms/i);
    });

    test("Should reject Spotify platform links safely", async () => {
      if (!validToken) return;
      const res = await request(app)
        .post("/api/media/import-audio")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/video streaming platforms/i);
    });
  });

  describe("Media Retrieval for Note", () => {
    test("GET /api/media/note/:noteId should return 404 for non-existent note", async () => {
      if (!validToken) return;
      const res = await request(app)
        .get("/api/media/note/9999999")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("GET /api/media/note/:noteId should return structured media object for valid note", async () => {
      if (!validToken || !testNoteId) return;
      const res = await request(app)
        .get(`/api/media/note/${testNoteId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.media).toBeDefined();
      expect(Array.isArray(res.body.media)).toBe(true);
    });
  });
});
