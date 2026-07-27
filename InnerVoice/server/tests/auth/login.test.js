import request from "supertest";
import app from "../../app.js";
import pool from "../../config/db.js";

describe("POST /api/auth/login", () => {
  afterAll(async () => {
    await pool.end();
  });

  test("should return 404 for non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@example.com",
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
