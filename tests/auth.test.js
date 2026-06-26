import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import { createUser } from "./helpers.js";

describe("Auth API", () => {
  it("registers a user and returns a token", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@example.com",
      password: "secret123"
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeTruthy();
    expect(response.body.data.email).toBe("alice@example.com");
  });

  it("rejects invalid login credentials", async () => {
    await createUser({
      name: "Bob",
      email: "bob@example.com",
      password: "secret123"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "bob@example.com",
      password: "wrong-password"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("returns the current user for a valid token", async () => {
    const { token, user } = await createUser({
      name: "Carol",
      email: "carol@example.com"
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data._id).toBe(user._id);
    expect(response.body.data.email).toBe("carol@example.com");
  });
});
