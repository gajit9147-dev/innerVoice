import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import pool from "../../config/db.js";
import env from "../../config/env.js";

describe("GET /api/profile", () => {
  afterAll(async () => {
    await pool.end();
  });

  test("should return 401 when no token is provided", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should return 401 for an invalid token", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer invalidtoken123");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should return 200 and profile for a valid token", async () => {
    // 1. Fetch a valid user from the database
    const [rows] = await pool.query("SELECT id, email FROM users LIMIT 1");
    if (rows.length === 0) {
      console.warn("Skipping valid token profile test: No users in database.");
      return;
    }

    const testUser = rows[0];

    // 2. Generate a valid token for this user
    const token = jwt.sign(
      { id: testUser.id, email: testUser.email, role: "user" },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 3. Make request
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.email).toBe(testUser.email);
  });
});
