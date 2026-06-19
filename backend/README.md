# Survey Redirector - Backend API Documentation

This document describes the API endpoints, authentication mechanisms, and database models for the Survey Redirector backend application.

---

## Base Configuration

- **Default Port:** Defined in `.env` (`process.env.PORT`).
- **Database:** MongoDB (connection established via `config/db.mjs`).
- **Global Error Handling:** All internal errors return a standard JSON structure:
  ```json
  {
    "success": false,
    "status": 500,
    "message": "Internal Server Error"
  }
  ```
- **404 Handler:** Accessing non-existing routes returns a `404 Not Found` response.

---

## Authentication & Middleware

### Authentication Middleware (`authMiddleware`)
- **Location:** [auth.middleware.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/middleware/auth.middleware.mjs)
- **Mechanism:** Reads the JWT token from the incoming request cookies (`cookies.token`).
- **Verification:** Verifies the token using `process.env.JWT_SECRET`. If valid, it decodes the payload, attaches it to `req.user`, and passes execution to the next handler.
- **Failures:** 
  - If no token is provided: Returns `401 Unauthorized`.
  - If token verification fails or database error occurs: Returns `500 Internal Server Error`.

---

## API Endpoints

### 1. User Authentication Routes
- **Base Path:** `/api/user`
- **Route Definitions:** [user.routes.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/routes/user.routes.mjs)

#### A. User Sign Up
- **Endpoint:** `POST /api/user/signUp`
- **Controller:** `signUp` in [user.controller.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/controllers/user.controller.mjs)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```
- **Responses:**
  - `200 OK`: User created successfully.
    ```json
    { "message": "User created successfully" }
    ```
  - `400 Bad Request`: If `email` or `name` is missing.
    ```json
    { "message": "Bad Request" }
    ```
  - `409 Conflict`: If the user already exists.
    ```json
    { "message": "User already exists, please login" }
    ```
  - `500 Internal Server Error`

#### B. User Sign In (Send OTP)
- **Endpoint:** `POST /api/user/signIn`
- **Controller:** `signIn` in [user.controller.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/controllers/user.controller.mjs)
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Responses:**
  - `200 OK`: OTP generated, saved to DB (valid for 10 minutes), and sent via mail.
    ```json
    { "message": "OTP sent successfully" }
    ```
  - `400 Bad Request`: If `email` is missing.
  - `404 Not Found`: If the user does not exist.
    ```json
    { "message": "User not found, please sign up first" }
    ```
  - `500 Internal Server Error`

#### C. Verify OTP
- **Endpoint:** `POST /api/user/verifyOtp`
- **Controller:** `verifyOtp` in [user.controller.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/controllers/user.controller.mjs)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Responses:**
  - `200 OK`: OTP verified successfully. Sets a `token` cookie.
    ```json
    { "message": "OTP verified successfully" }
    ```
    *Cookie Details:*
    - Name: `token`
    - Value: JWT (expires in 3 days)
    - Attributes: `httpOnly: true`, `secure` (in production), `sameSite` (`strict` in production, `lax` in development).
  - `400 Bad Request`: If `email` or `otp` is missing.
  - `404 Not Found`: User not found.
  - `401 Unauthorized`: Invalid OTP or OTP expired.
  - `500 Internal Server Error`

---

### 2. Survey Callback Webhooks (Typeform Redirects)
- **Base Path:** `/l`
- **Route Definitions:** [survey.routes.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/routes/survey.routes.mjs)
- **Access:** Public
- **Common Parameters:** All endpoints accept parameters either via `POST` or `GET` requests and expect query string variables:
  - `uid` (User ID/Respondent ID)
  - `pid` (Project ID/Survey ID)

#### A. Complete Survey Callback
- **Endpoint:** `GET /l/complete` or `POST /l/complete`
- **Controller:** `completeSurvey` in [survey.controller.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/controllers/survey.controller.mjs)
- **Action:** Creates a new survey entry with `status: "Complete"` and logs the requester's IP address.
- **Responses:**
  - `200 OK`: `{"message": "Survey updated successfully"}`
  - `400 Bad Request`: Missing `uid` or `pid`.

#### B. Terminate Survey Callback
- **Endpoint:** `GET /l/terminate` or `POST /l/terminate`
- **Controller:** `terminateSurvey` in [survey.controller.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/controllers/survey.controller.mjs)
- **Action:** Creates a new survey entry with `status: "Terminate"` and logs the requester's IP address.
- **Responses:**
  - `200 OK`: `{"message": "Survey updated successfully"}`
  - `400 Bad Request`: Missing `uid` or `pid`.

#### C. Quota Full Callback
- **Endpoint:** `GET /l/quotafull` or `POST /l/quotafull`
- **Controller:** `quotafullSurvey` in [survey.controller.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/controllers/survey.controller.mjs)
- **Action:** Creates a new survey entry with `status: "Quota Full"` and logs the requester's IP address.
- **Responses:**
  - `200 OK`: `{"message": "Survey updated successfully"}`
  - `400 Bad Request`: Missing `uid` or `pid`.

#### D. Security Terminated Callback
- **Endpoint:** `GET /l/securityterm` or `POST /l/securityterm`
- **Controller:** `securitytermSurvey` in [survey.controller.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/controllers/survey.controller.mjs)
- **Action:** Creates a new survey entry with `status: "Security Term"` and logs the requester's IP address.
- **Responses:**
  - `200 OK`: `{"message": "Survey updated successfully"}`
  - `400 Bad Request`: Missing `uid` or `pid`.

---

### 3. Dashboard Routes
- **Base Path:** `/api/dashboard`
- **Route Definitions:** [dashboard.routes.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/routes/dashboard.routes.mjs)
- **Access:** Protected by `authMiddleware` (Requires valid authentication cookie).
- **Pagination parameters (for survey list endpoints):**
  - `page` (Query param, default `1`)
  - `limit` (Query param, default `50`)

#### A. Get Survey Counts
- **Endpoint:** `GET /api/dashboard/getcount`
- **Controller:** `getSurveyCount`
- **Action:** Counts documents in DB globally and per status type.
- **Response:**
  ```json
  {
    "total_entries": 125,
    "complete_entries": 60,
    "terminate_entries": 35,
    "quota_full_entries": 20,
    "security_term_entries": 10
  }
  ```

#### B. Get Recent Surveys (All statuses)
- **Endpoint:** `GET /api/dashboard/getRecentSurveys`
- **Controller:** `getRecentSurveys`
- **Response:** Array of Survey documents sorted by `createdAt` descending.

#### C. Get Completed Surveys
- **Endpoint:** `GET /api/dashboard/getCompletedSurveys`
- **Controller:** `getCompletedSurveys`
- **Response:** Array of Survey documents where `status: "Complete"`.

#### D. Get Terminated Surveys
- **Endpoint:** `GET /api/dashboard/getTerminatedSurveys`
- **Controller:** `getTerminatedSurveys`
- **Response:** Array of Survey documents where `status: "Terminate"`.

#### E. Get Quota Full Surveys
- **Endpoint:** `GET /api/dashboard/getQuotaFullSurveys`
- **Controller:** `getQuotaFullSurveys`
- **Response:** Array of Survey documents where `status: "Quota Full"`.

#### F. Get Security Terminated Surveys
- **Endpoint:** `GET /api/dashboard/getSecurityTermSurveys`
- **Controller:** `getSecurityTermSurveys`
- **Response:** Array of Survey documents where `status: "Security Term"`.

#### G. Remove Survey
- **Endpoint:** `DELETE /api/dashboard/remove/:id`
- **Controller:** `removeSurvey`
- **Responses:**
  - `200 OK`: Returns the deleted Survey document.
  - `400 Bad Request`: If ID is missing.
  - `404 Not Found`: If Survey not found.

#### H. Update Survey Status
- **Endpoint:** `PUT /api/dashboard/update/:id`
- **Controller:** `updateSurvey`
- **Request Body:**
  ```json
  {
    "status": "Complete"
  }
  ```
- **Responses:**
  - `200 OK`: Returns the updated Survey document.
  - `400 Bad Request`: If ID or status is missing.
  - `404 Not Found`: If Survey not found.

---

## Data Models

### User Model (`User`)
- **Schema Reference:** [user.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/models/user.mjs)
- **Fields:**
  - `email` (String, required, unique)
  - `name` (String, required)
  - `otp` (String, optional)
  - `otpExpiry` (Date, optional)
  - `surveyAdmin` (Boolean, default: `false`)
  - `createdAt` / `updatedAt` (automatic timestamps)

### Survey Model (`Survey`)
- **Schema Reference:** [survey.mjs](file:///c:/Users/Himanshu/Desktop/Freelance/survey-redirector/backend/src/models/survey.mjs)
- **Fields:**
  - `ipAddress` (String, required)
  - `status` (String, required, Enum: `['Security Term', 'Quota Full', 'Terminate', 'Complete']`, default: `'Terminate'`)
  - `pid` (String, required)
  - `uid` (String, required)
  - `createdAt` / `updatedAt` (automatic timestamps)
