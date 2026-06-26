const bearerAuthScheme = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT"
  }
};

const schemas = {
  SuccessMessage: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed successfully" }
    }
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" }
    }
  },
  AuthRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      name: { type: "string", example: "Alice Johnson" },
      email: { type: "string", format: "email", example: "alice@example.com" },
      password: { type: "string", format: "password", example: "secret123" }
    }
  },
  User: {
    type: "object",
    properties: {
      _id: { type: "string", example: "684ec7de5ee47e9d7ba43210" },
      name: { type: "string", example: "Alice Johnson" },
      email: { type: "string", format: "email", example: "alice@example.com" }
    }
  },
  ProjectMember: {
    type: "object",
    properties: {
      user: { $ref: "#/components/schemas/User" },
      role: { type: "string", enum: ["owner", "admin", "member"] },
      joinedAt: { type: "string", format: "date-time" }
    }
  },
  Project: {
    type: "object",
    properties: {
      _id: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      owner: { $ref: "#/components/schemas/User" },
      members: {
        type: "array",
        items: { $ref: "#/components/schemas/ProjectMember" }
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  Issue: {
    type: "object",
    properties: {
      _id: { type: "string" },
      project: {
        oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Project" }]
      },
      title: { type: "string" },
      description: { type: "string" },
      status: { type: "string", enum: ["open", "in-progress", "resolved", "closed"] },
      priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
      labels: {
        type: "array",
        items: { type: "string" }
      },
      assignee: {
        oneOf: [{ type: "null" }, { $ref: "#/components/schemas/User" }]
      },
      createdBy: { $ref: "#/components/schemas/User" },
      dueDate: {
        oneOf: [{ type: "null" }, { type: "string", format: "date-time" }]
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  Comment: {
    type: "object",
    properties: {
      _id: { type: "string" },
      issue: { type: "string" },
      author: { $ref: "#/components/schemas/User" },
      content: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  }
};

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Issue Tracker API",
    version: "1.0.0",
    description: "JWT-secured API for collaborative project and issue tracking."
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server"
    }
  ],
  components: {
    securitySchemes: bearerAuthScheme,
    schemas
  },
  paths: {
    "/": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "API is running",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessMessage" }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" }
            }
          }
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Invalid request" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        summary: "Authenticate a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" }
            }
          }
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        summary: "Get the current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current user returned" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/projects": {
      get: {
        summary: "List accessible projects",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Projects returned" }
        }
      },
      post: {
        summary: "Create a project",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Project created" },
          400: { description: "Invalid request" }
        }
      }
    },
    "/api/projects/{id}": {
      get: {
        summary: "Get a project by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Project returned" },
          404: { description: "Project not found" }
        }
      },
      patch: {
        summary: "Update project details",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Project updated" },
          403: { description: "Forbidden" }
        }
      },
      delete: {
        summary: "Delete a project",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Project deleted" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/projects/{id}/members": {
      post: {
        summary: "Add a project member",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Member added" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/projects/{id}/members/{memberId}/role": {
      patch: {
        summary: "Update a project member role",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "memberId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Member role updated" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/projects/{id}/members/{memberId}": {
      delete: {
        summary: "Remove a project member",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "memberId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Member removed" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/issues": {
      get: {
        summary: "List issues with filters and pagination",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Issues returned" }
        }
      },
      post: {
        summary: "Create an issue",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Issue created" },
          400: { description: "Invalid request" }
        }
      }
    },
    "/api/issues/{id}": {
      get: {
        summary: "Get an issue by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Issue returned" },
          404: { description: "Issue not found" }
        }
      },
      patch: {
        summary: "Update an issue",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Issue updated" },
          400: { description: "Invalid request" }
        }
      },
      delete: {
        summary: "Delete an issue",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Issue deleted" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/comments": {
      post: {
        summary: "Create a comment on an issue",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Comment created" },
          400: { description: "Invalid request" }
        }
      }
    },
    "/api/comments/issue/{issueId}": {
      get: {
        summary: "List comments for an issue",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "issueId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Comments returned" },
          404: { description: "Issue not found" }
        }
      }
    },
    "/api/comments/{id}": {
      delete: {
        summary: "Delete a comment",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Comment deleted" },
          403: { description: "Forbidden" }
        }
      }
    }
  }
};

export default openApiDocument;
