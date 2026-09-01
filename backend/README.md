# Survey Redirector - Backend API Documentation

This document describes the API endpoints, authentication & authorization mechanisms, database models, Redis caching strategy, and background BullMQ workers for the Survey Redirector backend application.

---

## Base Infrastructure & Configuration

- **Default Port:** Defined in `.env` (`process.env.PORT`, default `5000`).
- **Database:** MongoDB (connected via [config/db.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/config/db.mjs)).
- **Caching:** Redis connection (configured via [config/redis.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/config/redis.mjs)).
- **Background Queues:** BullMQ queues powered by Redis ([config/bullmq.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/config/bullmq.mjs)).
- **Global Error & 404 Handling:** Handled in [middleware/error.middleware.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/middleware/error.middleware.mjs). Standard JSON structure:
  ```json
  {
    "success": false,
    "status": 500,
    "message": "Internal Server Error"
  }
  ```

---

## Authentication & Middleware

### 1. Authentication Middleware (`authMiddleware`)
- **Location:** [auth.middleware.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/middleware/auth.middleware.mjs)
- **Mechanism:** Reads the JWT token from incoming request cookies (`cookies.token`).
- **Redis Profile Caching:** Uses Redis key `user:<id>` to cache decoded user objects for 1 hour, minimizing database queries on high-traffic requests.
- **Failures:** 
  - If no token is provided: Returns `401 Unauthorized`.
  - If token is invalid or expired: Returns `401 Unauthorized` and clears invalid cookie.

### 2. Admin Middleware (`adminMiddleware`)
- **Location:** [admin.middleware.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/middleware/admin.middleware.mjs)
- **Mechanism:** Verifies that the authenticated user (`req.user`) has `surveyAdmin: true`.
- **Failures:** Returns `403 Forbidden` if the user is not a survey administrator.

---

## API Endpoints

### 1. User Authentication Routes
- **Base Path:** `/api/user`
- **Route File:** [user.routes.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/routes/user.routes.mjs)

#### A. User Sign Up
- **Endpoint:** `POST /api/user/signUp`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```
- **Responses:**
  - `200 OK`: `{"message": "User created successfully"}`
  - `400 Bad Request`: Missing `email` or `name`.
  - `409 Conflict`: User already exists.

#### B. User Sign In (Send OTP)
- **Endpoint:** `POST /api/user/signIn`
- **Request Body:** `{"email": "user@example.com"}`
- **Action:** Generates a 6-digit OTP (valid for 10 minutes), saves it to DB, and enqueues an email dispatch job via `emailQueue`.
- **Responses:**
  - `200 OK`: `{"message": "OTP sent successfully"}`
  - `404 Not Found`: User not found.

#### C. Verify OTP
- **Endpoint:** `POST /api/user/verifyOtp`
- **Request Body:** `{"email": "user@example.com", "otp": "123456"}`
- **Action:** Validates OTP and issues a JWT token set in an `httpOnly` cookie (`token`).
- **Responses:**
  - `200 OK`: `{"message": "OTP verified successfully"}`
  - `401 Unauthorized`: Invalid or expired OTP.

---

### 2. Traffic Routing
- **Base Path:** `/r`
- **Route File:** [traffic.routes.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/routes/traffic.routes.mjs)
- **Service:** [traffic.service.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/services/traffic.service.mjs)
- **Access:** Public

#### A. Redirect Entry Point
- **Endpoint:** `GET /r/:hash?vendor_rid=<respondent_id>`
- **Action:** Looks up the active survey matching the vendor `:hash`. Returns a 302 redirect to the frontend screener page:
  `http://<frontend-domain>/screener/:hash?vendor_rid=<vendor_rid>`

---

### 3. Demographics Screener
- **Base Path:** `/api/screener`
- **Route File:** [screener.routes.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/routes/screener.routes.mjs)
- **Service:** [screener.service.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/services/screener.service.mjs)

#### A. Get Screener Configuration & Check Eligibility
- **Endpoint:** `GET /api/screener/config/:hash`
- **Action:** 
  1. Validates survey active status and optional IP geolocation filtering (`allowedCountries`).
  2. Evaluates existing `screener_token_<hash>` JWT cookie if present to allow qualified users to bypass screener on repeat visits.
- **Response:** Returns `eligibilityRules` question array or qualification/rejection status.

#### B. Submit Screener Answers
- **Endpoint:** `POST /api/screener/submit`
- **Request Body:**
  ```json
  {
    "hash": "abc123hash",
    "vendor_rid": "VENDOR_RID_123",
    "answers": {
      "Age": "25-34",
      "Gender": "Male"
    }
  }
  ```
- **Action:** Evaluates answers against survey rules. Creates a `Transaction` record (status: `'started'` if qualified, `'screened_out'` if failed). Sets a 30-day JWT cookie `screener_token_<hash>` and enqueues a cache rebuild job.

---

### 4. Survey Callback Outcomes (Legacy Bridge & Alias)
- **Base Paths:** `/l` and `/i`
- **Route File:** [survey.routes.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/routes/survey.routes.mjs)
- **Controller:** [survey.controller.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/controllers/survey.controller.mjs)
- **Access:** Public (GET / POST)

#### Endpoints
- `GET/POST /l/complete` (Alias: `/i/complete`) $\rightarrow$ Status: `completed`
- `GET/POST /l/terminate` (Alias: `/i/terminate`) $\rightarrow$ Status: `terminate`
- `GET/POST /l/quotafull` (Alias: `/i/quotafull`) $\rightarrow$ Status: `quota_full`
- `GET/POST /l/securityterm` (Alias: `/i/securityterm`) $\rightarrow$ Status: `security_term`

#### Common Query Parameters
- `uid`: Transaction token / Vendor respondent ID.
- `pid`: Project ID / Survey identifier.

#### Action
Updates the matching `Transaction` record status, enqueues vendor postback execution to `webhookQueue`, and enqueues analytics cache update to `dashboardCacheQueue`.

---

### 5. Survey Administration Routes
- **Base Path:** `/api/admin/surveys`
- **Route File:** [surveyAdmin.routes.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/routes/surveyAdmin.routes.mjs)
- **Controller:** [surveyAdmin.controller.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/controllers/surveyAdmin.controller.mjs)
- **Access:** Protected (`authMiddleware` + `adminMiddleware`)

#### Endpoints
- **Suppliers:**
  - `GET /suppliers`: List suppliers.
  - `POST /suppliers`: Create supplier (`name`, `postbackUrl`).
  - `DELETE /suppliers/:id`: Delete supplier.
- **Vendors:**
  - `GET /vendors`: List vendors.
  - `POST /vendors`: Create vendor (`name`, `completeUrl`, `terminateUrl`, `quotaFullUrl`, `securityTermUrl`).
  - `DELETE /vendors/:id`: Delete vendor.
- **Transactions:**
  - `GET /transactions`: Paginated list of transactions with optional search by `transactionToken` or `vendorRid`.
  - `DELETE /transactions/:id`: Remove transaction record and rebuild dashboard cache.
- **Surveys:**
  - `GET /`: List all surveys with populated supplier and vendor details.
  - `POST /`: Create survey (`name`, `projectId`, `supplierId`, `baseSupplierUrl`, `ipFiltering`, `allowedCountries`, `eligibilityRules`, `vendorLinks`).
  - `GET /:id`: Get survey details by ID.
  - `PUT /:id`: Update survey configuration.
  - `DELETE /:id`: Delete survey.

---

### 6. Dashboard Analytics Routes
- **Base Path:** `/api/dashboard`
- **Route File:** [dashboard.routes.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/routes/dashboard.routes.mjs)
- **Controller:** [dashboard.controller.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/controllers/dashboard.controller.mjs)
- **Access:** Protected (`authMiddleware`)

#### Endpoints
- `GET /api/dashboard/getcount`: Total and status-wise transaction counts (cached in Redis as `dashboard:stats`).
- `GET /api/dashboard/getRecentSurveys`: Recent transactions list (cached in Redis as `dashboard:recent`).
- `GET /api/dashboard/getCompletedSurveys`: Filter transactions where status is `completed`.
- `GET /api/dashboard/getTerminatedSurveys`: Filter transactions where status is `terminate`.
- `GET /api/dashboard/getQuotaFullSurveys`: Filter transactions where status is `quota_full`.
- `GET /api/dashboard/getSecurityTermSurveys`: Filter transactions where status is `security_term`.
- `DELETE /api/dashboard/remove/:id`: Remove transaction.
- `PUT /api/dashboard/update/:id`: Manually update transaction status.

---

### 7. Mock Endpoints (End-to-End Testing)
- **Base Path:** `/`
- **Route File:** [mock.routes.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/routes/mock.routes.mjs)

#### Endpoints
- `GET /mock-supplier`: Simulates an upstream survey landing page with buttons for Complete, Terminate, Quota Full, and Security Term callbacks.
- `GET /mock-vendor-callback/complete`: Simulates downstream vendor receiving a completion postback.
- `GET /mock-vendor-callback/terminate`: Simulates vendor receiving a terminate postback.
- `GET /mock-vendor-callback/quotafull`: Simulates vendor receiving a quota full postback.
- `GET /mock-vendor-callback/securityterm`: Simulates vendor receiving a security term postback.

---

## Data Models

### 1. User Model (`User`)
- **Schema File:** [user.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/models/user.mjs)
- **Fields:**
  - `email` (String, required, unique)
  - `name` (String, required)
  - `otp` (String, optional)
  - `otpExpiry` (Date, optional)
  - `surveyAdmin` (Boolean, default: `false`)

### 2. Survey Model (`Survey`)
- **Schema File:** [survey.model.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/models/survey.model.mjs)
- **Fields:**
  - `name` (String, required)
  - `projectId` (String, required)
  - `supplierId` (ObjectId, ref: `Supplier`)
  - `baseSupplierUrl` (String, required, contains `[identifier]` macro)
  - `status` (Enum: `['active', 'paused', 'closed']`, default: `'active'`)
  - `ipFiltering` (Boolean, default: `false`)
  - `allowedCountries` (Array of Strings)
  - `eligibilityRules` (Array of `{ question, options, acceptedAnswers }`)
  - `vendorLinks` (Array of `{ vendorId, hash, quota }`)

### 3. Transaction Model (`Transaction`)
- **Schema File:** [transaction.model.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/models/transaction.model.mjs)
- **Fields:**
  - `transactionToken` (String, required, indexed)
  - `projectId` (String, indexed)
  - `serial` (Number, auto-incrementing per project)
  - `surveyId` (ObjectId, ref: `Survey`)
  - `vendorId` (ObjectId, ref: `Vendor`)
  - `vendorRid` (String)
  - `ipAddress` (String)
  - `country` / `countryCode` (String)
  - `status` (Enum: `['started', 'completed', 'screened_out', 'quota_full', 'fraud', 'terminate', 'security_term']`)
  - `startedAt` / `completedAt` (Date)

### 4. Supplier Model (`Supplier`)
- **Schema File:** [supplier.model.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/models/supplier.model.mjs)
- **Fields:**
  - `name` (String, required)
  - `postbackUrl` (String, optional)
  - `isActive` (Boolean, default: `true`)

### 5. Vendor Model (`Vendor`)
- **Schema File:** [vendor.model.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/models/vendor.model.mjs)
- **Fields:**
  - `name` (String, required)
  - `completeUrl` / `terminateUrl` / `quotaFullUrl` / `securityTermUrl` (String, optional)
  - `isActive` (Boolean, default: `true`)

---

## Background Workers & Queues (BullMQ)

The backend processes asynchronous jobs using **BullMQ** queues backed by Redis ([config/bullmq.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/config/bullmq.mjs)):

1. **Webhook Worker (`webhookQueue`)**
   - **File:** [webhook.worker.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/workers/webhook.worker.mjs)
   - **Function:** Dispatches postback requests to downstream vendors when a transaction status updates. Replaces macros (`{{vendor_rid}}`, `{{status}}`) in configured URLs and fires an HTTP GET request.

2. **Dashboard Cache Worker (`dashboardCacheQueue`)**
   - **File:** [dashboardCache.worker.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/workers/dashboardCache.worker.mjs)
   - **Function:** Asynchronously recalculates and pre-warms Redis caches (`dashboard:stats`, `dashboard:recent`, and status lists). Triggered whenever transactions are created, modified, or deleted.

3. **Email Worker (`emailQueue`)**
   - **File:** [email.worker.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/workers/email.worker.mjs)
   - **Function:** Handles asynchronous sending of transactional emails (e.g. login OTPs).
