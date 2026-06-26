# Issue Tracker API

A collaborative issue tracking backend built with Node.js, Express, MongoDB, and Mongoose.

## Highlights

- JWT authentication with protected routes
- Role-based project membership for owners, admins, and members
- Request validation with `express-validator`
- OpenAPI docs served at `/api/docs`
- Integration tests with `Vitest`, `Supertest`, and `mongodb-memory-server`
- Dockerized local development setup
- GitHub Actions CI for automated test runs

## Getting Started

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Start the server with `npm run dev`

## Scripts

- `npm run dev` starts the API in development mode
- `npm start` runs the production server
- `npm test` runs the integration test suite
- `npm run test:coverage` runs tests with coverage

## API Docs

- Swagger UI: `http://localhost:5000/api/docs`
- OpenAPI JSON: `http://localhost:5000/api/docs.json`

## Docker

Run the app and MongoDB together:

```bash
docker compose up --build
```
