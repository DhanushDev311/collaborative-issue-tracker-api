import request from "supertest";

import app from "../src/app.js";

let counter = 0;

export const createUser = async (overrides = {}) => {
  counter += 1;

  const payload = {
    name: overrides.name || `User ${counter}`,
    email: overrides.email || `user${counter}@example.com`,
    password: overrides.password || "secret123"
  };

  const response = await request(app).post("/api/auth/register").send(payload);

  return {
    response,
    token: response.body.token,
    user: response.body.data,
    payload
  };
};

export const createProject = async (token, overrides = {}) => {
  return request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: overrides.name || "Backend Platform",
      description: overrides.description || "API hardening work"
    });
};

export const createIssue = async (token, projectId, overrides = {}) => {
  return request(app)
    .post("/api/issues")
    .set("Authorization", `Bearer ${token}`)
    .send({
      project: projectId,
      title: overrides.title || "Fix validation gap",
      description: overrides.description || "Add stronger input validation",
      priority: overrides.priority || "high",
      ...overrides
    });
};
