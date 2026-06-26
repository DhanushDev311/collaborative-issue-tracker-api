import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import { createIssue, createProject, createUser } from "./helpers.js";

describe("Issue API", () => {
  it("creates and filters issues for accessible projects", async () => {
    const owner = await createUser({ email: "owner2@example.com" });
    const projectResponse = await createProject(owner.token, { name: "Filtering Project" });
    const projectId = projectResponse.body.data._id;

    const createResponse = await createIssue(owner.token, projectId, {
      title: "First issue",
      priority: "urgent",
      labels: ["Backend", "backend", " API "]
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.labels).toEqual(["backend", "api"]);

    const listResponse = await request(app)
      .get("/api/issues")
      .query({ priority: "urgent", search: "first" })
      .set("Authorization", `Bearer ${owner.token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.count).toBe(1);
    expect(listResponse.body.data[0].title).toBe("First issue");
  });

  it("tracks status history when an issue is updated", async () => {
    const owner = await createUser({ email: "owner3@example.com" });
    const projectResponse = await createProject(owner.token, { name: "Status Project" });
    const issueResponse = await createIssue(owner.token, projectResponse.body.data._id);
    const issueId = issueResponse.body.data._id;

    const updateResponse = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "resolved" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.status).toBe("resolved");
    expect(updateResponse.body.data.statusHistory).toHaveLength(2);
    expect(updateResponse.body.data.statusHistory[1]).toMatchObject({
      from: "open",
      to: "resolved"
    });
  });
});
