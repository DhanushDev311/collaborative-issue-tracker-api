import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, beforeEach } from "vitest";

import connectDB, { disconnectDB } from "../src/config/db.js";

let mongoServer;

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "7d";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri("issue-tracker-api-test");
  await connectDB(process.env.MONGO_URI);
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;

  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await disconnectDB();

  if (mongoServer) {
    await mongoServer.stop();
  }
});
