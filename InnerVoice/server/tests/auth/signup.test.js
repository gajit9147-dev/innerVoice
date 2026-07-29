import request from "supertest";
import app from "../../app.js";
import pool from "../../config/db.js";

describe("POST /api/auth/signup", () => {
  const testEmail = `test_${Date.now()}_signup@example.com`;

  afterAll(async () => {
    try {
      await pool.query("DELETE FROM users WHERE email = ?", [testEmail]);
    } catch (e) {
      // Ignore if pool already closed or user not found
    }
    await pool.end();
  });

  test("should register a user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        full_name: "Test User",
        email: testEmail,
        password: "Password123",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User registered successfully");
  });

  test("should fail for duplicate email registration", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        full_name: "Test User 2",
        email: testEmail,
        password: "Password123",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User already exists");
  });

  test("should fail when missing required fields", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "incomplete@example.com",
      });

    // The validation middleware/schema checks for this
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
