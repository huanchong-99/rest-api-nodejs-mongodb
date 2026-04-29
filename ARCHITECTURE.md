# Architecture Overview

## Layered Architecture

This project follows a strict **Route → Controller → Service → Repository → Model** layered architecture, all located under `src/`.

```
src/
├── app.js                    # Express app setup, middleware, routes, error handler
├── server.js                 # HTTP server entry point (alternative to bin/www)
├── config/
│   └── db.js                 # MongoDB connection
├── errors/
│   └── AppError.js           # Custom error class (statusCode, status, isOperational, data)
├── middlewares/
│   ├── auth.js               # JWT authentication middleware (express-jwt)
│   └── errorHandler.js       # Global error handler (catches all errors)
├── models/
│   ├── BookModel.js          # Mongoose Book schema
│   └── UserModel.js          # Mongoose User schema
├── repositories/
│   ├── BookRepository.js     # Book data access layer (Mongoose CRUD)
│   └── UserRepository.js     # User data access layer (Mongoose CRUD)
├── services/
│   ├── AuthService.js        # Auth business logic (register, login, OTP)
│   └── BookService.js        # Book business logic (CRUD + authorization)
├── controllers/
│   ├── AuthController.js     # Auth HTTP handlers
│   └── BookController.js     # Book HTTP handlers
├── routes/
│   ├── index.js              # Root route (/)
│   ├── api.js                # API route aggregator (/api/)
│   ├── auth.js               # Auth routes with validation (/api/auth/)
│   └── book.js               # Book routes with validation (/api/book/)
└── utils/
    ├── AppError.js           # Re-exports from src/errors/AppError.js
    ├── apiResponse.js        # Unified API response helpers
    ├── catchAsync.js         # Async error wrapper for route handlers
    ├── constants.js          # App constants
    ├── mailer.js             # Email sending utility
    └── utility.js            # General utilities
```

## Dependency Flow

```
Routes → Controllers → Services → Repositories → Models
         │                │
         └── catchAsync ──┘  (wraps async handlers, catches errors)
                                  │
                          AppError (src/errors/AppError.js)
                                  │
                          errorHandler (src/middlewares/errorHandler.js)
```

- **Routes** define URL patterns, apply validation chains and auth middleware
- **Controllers** extract data from the request and delegate to Services
- **Services** contain business logic, authorization checks, data transformation
- **Repositories** encapsulate all Mongoose/database operations
- **Models** define Mongoose schemas

## Custom Error Handling

### AppError (`src/errors/AppError.js`)

Extends the native `Error` class with HTTP-aware properties:

- `statusCode` — HTTP status code (400, 401, 404, 500, etc.)
- `status` — `'fail'` for 4xx, `'error'` for 5xx
- `isOperational` — `true`, signals the global error handler to format a client-safe response
- `data` — optional payload (e.g. validation errors)

### Global Error Handler (`src/middlewares/errorHandler.js`)

Catches all errors forwarded via `next(err)`:

1. **Mongoose CastError** → normalized to 400 with descriptive message
2. **express-jwt UnauthorizedError** → 401 Unauthorized response
3. **AppError (operational)** → appropriate response based on statusCode (400/401/404/500)
4. **Unknown errors** → 500 Internal Server Error (internal details hidden)

## Entry Points

- `bin/www` — primary entry point, requires `../src/app`
- `src/server.js` — alternative HTTP server entry point
