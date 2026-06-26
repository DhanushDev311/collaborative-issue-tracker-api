# Collaborative Issue Tracker API

A REST API for collaborative issue tracking built with **Node.js**, **Express.js**, and **MongoDB**. Users can create projects, invite members, manage issues, assign tasks, and collaborate through comments with role-based access control.

## Features

* User authentication using JWT
* Role-based authorization (Owner, Admin, Member)
* Create and manage projects
* Invite and manage project members
* Create, update, assign, and track issues
* Comment on issues
* Request validation using `express-validator`
* Swagger API documentation
* Integration tests using Vitest and Supertest
* Docker support for local development
* GitHub Actions workflow for automated testing

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* express-validator
* Swagger (OpenAPI)
* Vitest
* Supertest
* Docker
* GitHub Actions

## Project Structure

```text
src/
├── config/
├── controllers/
├── docs/
├── middlewares/
├── models/
├── routes/
├── utils/
├── validators/
├── app.js
└── server.js

tests/
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/collaborative-issue-tracker-api.git
cd collaborative-issue-tracker-api
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using the provided example:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm start
```

Starts the application in production mode.

```bash
npm test
```

Runs the integration tests.

```bash
npm run test:coverage
```

Runs tests with coverage.

## API Documentation

Once the server is running:

* Swagger UI: `http://localhost:5000/api/docs`
* OpenAPI JSON: `http://localhost:5000/api/docs.json`

## Running with Docker

```bash
docker compose up --build
```

## Environment Variables

Create a `.env` file and configure the required variables:

```env
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
```

Refer to `.env.example` for the complete list.

## Testing

Integration tests are written using **Vitest**, **Supertest**, and **mongodb-memory-server**.

Run the tests:

```bash
npm test
```

## Future Improvements

Some features I'd like to add in the future:

* Refresh token authentication
* Password reset
* Pagination and filtering
* Email notifications
* File attachments
* Redis caching
* Activity logs

## License

MIT License.
