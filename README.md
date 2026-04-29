# Nodejs Expressjs MongoDB REST API – Layered Architecture

[![CI](https://github.com/huanchong-99/rest-api-nodejs-mongodb/actions/workflows/ci.yml/badge.svg)](https://github.com/huanchong-99/rest-api-nodejs-mongodb/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](./coverage)
[![Node](https://img.shields.io/badge/node-18.x%20%7C%2020.x-green)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A production-ready REST API built with **Node.js**, **Express**, and **MongoDB**, structured using a strict **layered architecture** pattern with clear separation of concerns.

## Architecture

```
src/
├── app.js                  # Express app entry point
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── AuthController.js   # Auth request handlers
│   └── BookController.js   # Book request handlers
├── middlewares/
│   ├── auth.js             # JWT authentication middleware
│   └── errorHandler.js     # Global error handler
├── models/
│   ├── BookModel.js        # Book Mongoose model
│   └── UserModel.js        # User Mongoose model
├── repositories/
│   ├── BookRepository.js   # Book data access layer
│   └── UserRepository.js   # User data access layer
├── routes/
│   ├── index.js            # Home route
│   ├── api.js              # API router mounting
│   ├── auth.js             # Auth routes + validation
│   └── book.js             # Book routes + validation
├── services/
│   ├── AuthService.js      # Auth business logic
│   └── BookService.js      # Book business logic
└── utils/
    ├── AppError.js          # Custom error class
    ├── apiResponse.js       # Unified response helpers
    ├── catchAsync.js        # Async error wrapper
    ├── constants.js         # App constants
    ├── mailer.js            # Email helper
    └── utility.js           # General utilities
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Routes** | Define endpoints, apply validation middleware, delegate to controllers |
| **Controllers** | Receive HTTP request, call service, return HTTP response |
| **Services** | Business logic (password hashing, JWT, authorization checks) |
| **Repositories** | Database operations (encapsulate all Mongoose calls) |
| **Models** | Mongoose schema/model definitions |

## Features

- Basic Authentication (Register/Login with hashed password)
- Account confirmation with 4-digit OTP
- Email helper ready — just import and use
- JWT Tokens — requests with `Authorization: Bearer <token>` header
- Pre-defined response structures with proper status codes
- CORS enabled
- **Book** CRUD example
- Input validation with express-validator
- Postman collection included
- Unit tests (services) + Integration tests (API endpoints)
- Code coverage with Jest (≥80% threshold)
- CI pipeline with GitHub Actions (Node 18.x / 20.x matrix)
- Docker deployment with docker-compose
- ESLint configured

## API Endpoints

### Authentication
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| POST | `/api/auth/verify-otp` | Verify account with OTP | No |
| POST | `/api/auth/resend-verify-otp` | Resend confirmation OTP | No |

### Books
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/book` | List all books for user | Yes |
| GET | `/api/book/:id` | Get book detail | Yes |
| POST | `/api/book` | Create a new book | Yes |
| PUT | `/api/book/:id` | Update a book | Yes |
| DELETE | `/api/book/:id` | Delete a book | Yes |

## Quick Start

### Prerequisites

- Node.js **18+** (CI tests against 18.x and 20.x)
- MongoDB **4+**

### Using Git

```bash
git clone <repository-url> ./myproject
cd myproject
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
```

#### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017/mydb` |
| `JWT_SECRET` | Secret key for JWT signing | `my-secret-key` |
| `JWT_TIMEOUT_DURATION` | JWT expiration | `2 hours` |
| `EMAIL_SMTP_HOST` | SMTP server host | `smtp.example.com` |
| `EMAIL_SMTP_PORT` | SMTP server port | `587` |
| `EMAIL_SMTP_USERNAME` | SMTP username | `user@example.com` |
| `EMAIL_SMTP_PASSWORD` | SMTP password | `password` |

### Running Locally

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

### Using Docker

```bash
docker-compose up --build
```

This starts both the API server (port 3000) and MongoDB (port 27017).

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report (≥80% threshold)
npm run test:coverage
```

### Test Structure

```
test/
├── testConfig.js                  # Test environment setup
├── auth.js                        # Integration: Auth (Mocha)
├── book.js                        # Integration: Book (Mocha)
├── unit/
│   └── services/
│       ├── AuthService.test.js    # Unit: Auth (Mocha/Sinon)
│       └── BookService.test.js    # Unit: Book (Mocha/Sinon)
└── jest/                          # Jest test suite
    ├── unit/
    │   ├── utils.test.js          # Unit: apiResponse, catchAsync, utility helpers
    │   ├── AppError.test.js       # Unit: AppError class (status, isOperational)
    │   ├── errorHandler.test.js   # Unit: Global error handler middleware
    │   ├── AuthService.test.js    # Unit: Auth business logic
    │   └── BookService.test.js    # Unit: Book business logic
    └── integration/
        └── api.test.js            # Integration: Full API endpoints (MongoMemoryServer)
```

### Coverage

The project maintains ≥80% code coverage across all layers (controllers, services, repositories, utils). Coverage reports are generated in the `coverage/` directory.

## Linting

```bash
npm run lint
```

## CI/CD

GitHub Actions CI pipeline (`.github/workflows/ci.yml`):
- **Matrix**: Node.js 18.x and 20.x
- **Steps**: Install → Lint → Test with Coverage → Upload Coverage Artifact
- **Triggers**: Push to `master` and `feat/code-standards-linting`, PRs to `master`

## License

This project is open-sourced software licensed under the MIT License.
