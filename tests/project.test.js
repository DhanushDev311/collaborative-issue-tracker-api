import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import { createProject, createUser } from "./helpers.js";

describe("Project API", () => {
  it("creates a project for an authenticated user", async () => {
    const { token } = await createUser();

    const response = await createProject(token, {
      name: "Issue Tracker Revamp"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe("Issue Tracker Revamp");
    expect(response.body.data.members).toHaveLength(1);
    expect(response.body.data.members[0].role).toBe("owner");
  });

  it("lets an owner add and promote a member", async () => {
    const owner = await createUser({ email: "owner@example.com" });
    const member = await createUser({ email: "member@example.com" });
    const projectResponse = await createProject(owner.token);
    const projectId = projectResponse.body.data._id;

    const addMemberResponse = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        email: member.payload.email,
        role: "member"
      });

    expect(addMemberResponse.status).toBe(200);
    expect(addMemberResponse.body.data.members).toHaveLength(2);

    const promoteResponse = await request(app)
      .patch(`/api/projects/${projectId}/members/${member.user._id}/role`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ role: "admin" });

    expect(promoteResponse.status).toBe(200);
    const promotedMember = promoteResponse.body.data.members.find(
      (entry) => entry.user._id === member.user._id
    );
    expect(promotedMember.role).toBe("admin");
  });
});
