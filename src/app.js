import express from "express";
import swaggerUi from "swagger-ui-express";

import openApiDocument from "./docs/openapi.js";
import authRoutes from "./routes/authRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import notFound from "./middlewares/notFoundMiddleware.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Issue Tracker API is running"
  });
});

app.get("/api/docs.json", (req, res) => {
  res.status(200).json(openApiDocument);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/projects", projectRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
