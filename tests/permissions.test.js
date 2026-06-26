import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import { createIssue, createProject, createUser } from "./helpers.js";

describe("Permission checks", () => {
  it("prevents non-members from accessing an issue", async () => {
    const owner = await createUser({ email: "owner4@example.com" });
    const outsider = await createUser({ email: "outsider@example.com" });
    const projectResponse = await createProject(owner.token);
    const issueResponse = await createIssue(owner.token, projectResponse.body.data._id);

    const response = await request(app)
      .get(`/api/issues/${issueResponse.body.data._id}`)
      .set("Authorization", `Bearer ${outsider.token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Access denied for this issue");
  });

  it("allows a project admin to delete an issue created by another member", async () => {
    const owner = await createUser({ email: "owner5@example.com" });
    const admin = await createUser({ email: "admin@example.com" });
    const member = await createUser({ email: "member2@example.com" });
    const projectResponse = await createProject(owner.token, { name: "Permissions Project" });
    const projectId = projectResponse.body.data._id;

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: admin.payload.email, role: "admin" });

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: member.payload.email, role: "member" });

    const issueResponse = await createIssue(member.token, projectId, {
      title: "Member issue"
    });

    const deleteResponse = await request(app)
      .delete(`/api/issues/${issueResponse.body.data._id}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe(
      "Issue and related comments deleted successfully"
    );
  });
});
