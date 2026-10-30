# 🚀 MERN Stack Backend Boilerplate

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.x-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000?style=flat&logo=express)](https://expressjs.com/)
[![MongoDB Native](https://img.shields.io/badge/MongoDB-Native%20Driver%20v6-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.4-010101?style=flat&logo=socketdotio)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-ready, production-grade **MERN Stack Backend Boilerplate** built with modern JavaScript (Babel ES Modules), Express.js, the official MongoDB Native Driver, Socket.IO, and production-tested security standards.

Designed as an extensible foundation for high-performance SaaS platforms, collaborative tools, and real-time web applications.

---

## 🌟 Key Architecture & Features

### 🔐 1. Dual-Authentication Engine
- **Cross-Platform Compatibility:** Supports **HttpOnly Cookies** (secure for desktop web browsers) and **Bearer Authorization Header** (seamless support for mobile browsers like Safari iOS, mobile WebViews, and third-party API clients).
- **Silent Token Rotation:** Automatic expiration handling returning `410 GONE` to trigger graceful, silent access token refresh without disrupting user flows.
- **Google OAuth 2.0:** One-tap Google authentication with server-side token verification using official `google-auth-library` and automatic user provisioning.
- **Account Verification:** Transactional email verification powered by **Brevo (Sendinblue) REST API v3**.
- **Password Security:** Salted password hashing with `bcryptjs`.

### ⚡ 2. MongoDB Native Driver (Zero ORM Overhead)
- Direct utilization of the official MongoDB Native Driver (`mongodb` v6) providing direct database access without the memory overhead and query constraints of heavy ORMs/ODMs.
- Strict schema validation using **Joi** before database insertion to guarantee structural data integrity.
- Connection pooling and graceful shutdown handling via `async-exit-hook`.

### 🛡️ 3. Multi-Layer Security Hardening
- **Anti-Brute-Force Rate Limiting:** Targeted IP rate limiters on `/login` and `/register` endpoints via `express-rate-limit`.
- **Global API Rate Limiting:** Blanket traffic throttling to protect against DDoS, scraping, and endpoint abuse.
- **HTTP Security Headers:** Configured with `nosniff`, `DENY` clickjacking, and `X-XSS-Protection`.
- **Server Fingerprinting Disabled:** `x-powered-by` header disabled.
- **Strict CORS Protection:** Dynamic origin whitelisting with credentials enabled.

### 📡 4. Real-Time WebSockets (Socket.IO)
- Integrated Socket.IO server configured with identical CORS policies.
- Room-based architecture enabling private user rooms (`userId`), broadcast rooms, and instant event dispatching.

### ☁️ 5. Cloud Media Uploads
- Direct-to-cloud media streaming using **Cloudinary v2** and **Streamifier** via in-memory `multer` storage (no local disk temp files).

### 🧩 6. Blueprint Example CRUD Resource
- Comes with a fully realized, extensible `example` resource demonstrating best-practice code patterns:
  - Joi schema validation (`exampleValidation.js`)
  - Route definitions with authentication guard (`exampleRoute.js`)
  - Request/Response controller (`exampleController.js`)
  - Business logic service layer (`exampleService.js`)
  - MongoDB native model with pagination, search regex, and soft-delete (`exampleModel.js`)

---

## 📁 Project Structure

```text
mern-boilerplate-be/
├── build/                       # Compiled production code (Babel output)
├── src/
│   ├── config/                  # Environment & connection configurations
│   │   ├── cors.js              # CORS policy and dynamic origin validator
│   │   ├── environment.js       # Centralized process.env variables
│   │   └── mongodb.js           # MongoDB native driver client instance & hooks
│   ├── controllers/             # Request handlers (HTTP status codes & JSON payload)
│   │   ├── userController.js    # Authentication & user profile controller
│   │   └── exampleController.js # Example CRUD resource controller
│   ├── middlewares/             # Express middlewares
│   │   ├── authMiddleware.js    # Dual-auth verification (Cookie & Bearer)
│   │   ├── errorHandlingMiddleware.js # Centralized error & stack trace handler
│   │   ├── multerUploadMiddleware.js  # Memory-storage file upload filter
│   │   └── rateLimiterMiddleware.js   # Anti-DDoS and anti-brute-force limiters
│   ├── models/                  # Database models & Joi validation schemas
│   │   ├── userModel.js         # User collection schema & DB queries
│   │   └── exampleModel.js      # Example collection schema & CRUD queries
│   ├── providers/               # Third-party service integrations
│   │   ├── BrevoProvider.js     # Transactional email dispatch
│   │   ├── CloudinaryProvider.js# Cloudinary media stream uploader
│   │   └── JwtProvider.js       # JWT generation and verification
│   ├── routes/
│   │   └── v1/                  # Version 1 API routes
│   │       ├── index.js         # API root router & status ping
│   │       ├── userRoute.js     # Authentication routes
│   │       └── exampleRoute.js  # Example CRUD resource routes
│   ├── services/                # Business logic layer
│   │   ├── userService.js       # User & auth business flows
│   │   └── exampleService.js    # Example resource business flows
│   ├── sockets/                 # Socket.IO handlers
│   │   └── socketServer.js      # WebSocket rooms & event routing
│   ├── utils/                   # Shared utilities & constants
│   │   ├── algorithms.js        # Pagination skip algorithms
│   │   ├── ApiError.js          # Custom operational error class
│   │   ├── constants.js         # System constants & pagination defaults
│   │   ├── formatters.js        # Data sanitizers (pickUser, slugify)
│   │   └── validators.js        # Regex validation patterns
│   └── server.js                # Express & Socket.IO server bootstrapper
├── .babelrc                     # Babel transpiler configuration
├── .eslintrc.cjs                # ESLint code styling rules
├── .gitignore                   # Git ignore patterns
├── jsconfig.json                # Path alias configuration (~/* -> ./src/*)
├── package.json                 # Dependencies & scripts
├── .env.example                 # Environment variables template
└── README.md                    # Project documentation
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables accordingly:

| Variable | Description | Example / Notes |
| :--- | :--- | :--- |
| `BUILD_MODE` | Application mode | `dev` or `production` |
| `LOCAL_DEV_APP_HOST` | Local host binding | `localhost` |
| `LOCAL_DEV_APP_PORT` | Local port | `8017` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb+srv://<user>:<password>@cluster.mongodb.net` |
| `DATABASE_NAME` | MongoDB Database Name | `mern-boilerplate-db` |
| `WEBSITE_DOMAIN_DEVELOPMENT` | Frontend origin (dev) | `http://localhost:5173` |
| `WEBSITE_DOMAIN_PRODUCTION` | Frontend origin (prod) | `https://your-production-app.vercel.app` |
| `BREVO_API_KEY` | Brevo REST API v3 Key | Must start with `xkeysib-` (NOT `xsmtpsib-`) |
| `ADMIN_EMAIL_ADDRESS` | Sender email address | `admin@yourdomain.com` |
| `ADMIN_EMAIL_NAME` | Sender display name | `MERN Boilerplate Admin` |
| `ACCESS_TOKEN_SECRET_SIGNATURE` | JWT Access Token Secret | Secure 64-character random string |
| `ACCESS_TOKEN_LIFE` | JWT Access Token Lifetime | `1h` |
| `REFRESH_TOKEN_SECRET_SIGNATURE` | JWT Refresh Token Secret | Secure 64-character random string |
| `REFRESH_TOKEN_LIFE` | JWT Refresh Token Lifetime | `14d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | Found in Cloudinary console |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Found in Cloudinary console |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Found in Cloudinary console |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | From Google Cloud Console |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The server will boot with `nodemon` and `babel-node` at:
`http://localhost:8017`

### 3. Build & Run for Production
```bash
# Compile ES modules using Babel to build/
npm run build

# Start the compiled production server
npm start
```

---

## 📡 API Reference Overview

### Base URL: `/v1`

#### Health Check
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/v1/status` | Service status check | No |

#### Authentication & User Management (`/v1/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/v1/users/register` | Register a new account (triggers Brevo email) | No (Rate-limited) |
| `PUT` | `/v1/users/verify` | Verify email address with verification token | No |
| `POST` | `/v1/users/login` | Log in with email & password | No (Rate-limited) |
| `POST` | `/v1/users/google-login` | Log in / Sign up with Google OAuth ID token | No (Rate-limited) |
| `DELETE` | `/v1/users/logout` | Clear auth cookies and invalidate session | No |
| `GET` | `/v1/users/refresh_token` | Issue new access token using refresh token | No |
| `GET` | `/v1/users/me` | Retrieve authenticated user profile | **Yes** |
| `PUT` | `/v1/users/update` | Update profile, change password, or upload avatar | **Yes** |

#### Example CRUD Resource (`/v1/examples`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/v1/examples` | Query paginated list with search query (`?page=1&itemsPerPage=12&q=test`) | **Yes** |
| `POST` | `/v1/examples` | Create a new example item | **Yes** |
| `GET` | `/v1/examples/:id` | Retrieve single item details | **Yes** |
| `PUT` | `/v1/examples/:id` | Update item title, description, or status | **Yes** |
| `DELETE` | `/v1/examples/:id` | Soft-delete an item | **Yes** |

---

## 🌐 WebSocket Events (Socket.IO)

Clients connect to the root URL via `socket.io-client`.

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `FE_USER_JOIN_ROOM` | Client → Server | `userId` | Subscribes socket to personal user notification room |
| `FE_USER_LEAVE_ROOM` | Client → Server | `userId` | Unsubscribes socket from user room |
| `FE_SEND_NOTIFICATION` | Client → Server | `{ recipientId, ... }` | Sends private notification to recipient room |
| `BE_RECEIVE_NOTIFICATION` | Server → Client | Notification object | Dispatched exclusively to target recipient room |
| `FE_BROADCAST_ALL` | Client → Server | Payload | Broadcasts event to all active clients |

---

## 🛠️ Testing the Build

Verify Babel transpilation and linting:
```bash
npm run lint
npm run build
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
Created with ❤️ by [Duy Cuong](https://github.com/duycuongdev).

