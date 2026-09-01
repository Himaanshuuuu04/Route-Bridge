
---

# 1. Platform Summary

The **Survey Redirector** is a full-stack, secure traffic routing and redirection management system for market research surveys. It bridges the gap between **Downstream Vendors** (who source respondents/traffic) and **Upstream Suppliers** (who host the actual client surveys, such as Typeform, Qualtrics, or Cint).

### Core Components
*   **Frontend (Next.js)**: Provides an administrative dashboard to manage suppliers, vendors, surveys, and transactions. It also hosts the **Screener Page** where respondents answer demographic questions.
*   **Backend (Node.js & Express & MongoDB)**: Manages authentication (via passwordless Email OTP + JWT cookies), traffic routing, eligibility screening, webhooks/redirect outcomes, Redis caching for fast user profiles and dashboard metrics, and asynchronous background queues using **BullMQ & Redis** (`webhookQueue`, `dashboardCacheQueue`, `emailQueue`) to propagate outcomes back to vendors.

---

# 2. Lifecycle of Links, Redirects, and Webhooks

The platform manages the complete lifecycle of a respondent's journey through a series of dynamic redirects, parameter mapping, and webhook notifications. Below is the step-by-step flow:

```mermaid
graph TD
    A[Downstream Vendor Link] -->|1. HTTP Redirect /r/:hash| B(Backend Traffic Routing)
    B -->|2. 302 Redirect| C[Frontend Screener Page]
    C -->|3. Qualify Check / Eligibility Rules| D{Qualified?}
    D -->|No| E[Screened Out / Rejection Page]
    D -->|Yes| F[Upstream Supplier Survey Link]
    F -->|4. Replaces [identifier] with Transaction Token| G[Supplier Platform]
    G -->|5. Complete, Terminate, or Quota Full| H[Callback/Redirect /l/* or /api/webhooks]
    H -->|6. Updates Transaction Status| I(Backend Webhook Service)
    I -->|7. Enqueues Webhook Job| J[BullMQ Worker: webhook.worker]
    J -->|8. HTTP GET with macros resolved| K[Vendor Postback URL]
```

### Step 1: Entry / Incoming Traffic (Vendor Link)
*   **Generated Link Format:** `http://<backend-domain>/r/:hash?vendor_rid=<vendor_respondent_id>`
*   **Purpose:** The entry point distributed to a **Vendor** to send respondents into a specific survey. 
    *   `:hash`: A unique lookup hash mapped to a survey's specific vendor configuration.
    *   `vendor_rid`: The unique respondent ID provided by the vendor to track individual completions.
*   **Redirect Logic:** The controller ([traffic.service.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/services/traffic.service.mjs)) verifies that the survey is `active` and redirects the user (302) to the screener:
    `http://<frontend-domain>/screener/:hash?vendor_rid=<vendor_respondent_id>`

### Step 2: Demographics Screener (Eligibility Check)
*   **Screener UI:** The frontend displays input fields defined in the survey's `eligibilityRules`.
*   **Repeat Visit Check:** The frontend checks for a cookie or localStorage token (`screener_token_<hash>`). If the respondent has already qualified previously, they are automatically forwarded to the survey, preventing repeated screener submissions.
*   **Submission (`POST /api/screener/submit`):**
    *   **If unqualified (Screened Out):** A transaction is recorded with status `'screened_out'`, and the respondent is shown a rejection message.
    *   **If qualified:** A transaction is recorded in MongoDB ([transaction.model.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/models/transaction.model.mjs)) with status `'started'`. The **Transaction Token** is set directly to the `vendor_rid` (with a fallback to a generated UUID if missing).

### Step 3: Forwarding to Upstream Supplier (Supplier Survey Link)
*   **Generated Link Format:** Replaces the `[identifier]` placeholder in the survey's `baseSupplierUrl` with the `transactionToken` (which is the exact `vendor_rid`).
    *   *Example Base URL:* `https://survey-platform.com/run?uid=[identifier]`
    *   *Resulting Supplier URL:* `https://survey-platform.com/run?uid=VENDOR_RID_1234`
*   **Action:** The frontend redirects the respondent's browser to this generated URL to fill out the actual survey on the supplier's platform.

### Step 4: Survey Outcome Callbacks (Supplier redirects back to Platform)
When the respondent completes or exits the survey, the upstream supplier redirects them back using one of the outcome URLs (Legacy Bridge or direct server webhooks).

*   **1. Client-Side Redirects (Legacy Bridge):**
    *   **Complete:** `/l/complete?uid=<transactionToken>&pid=<projectId>`
    *   **Terminate (Screen Out):** `/l/terminate?uid=<transactionToken>&pid=<projectId>`
    *   **Quota Full:** `/l/quotafull?uid=<transactionToken>&pid=<projectId>`
    *   **Security Terminated:** `/l/securityterm?uid=<transactionToken>&pid=<projectId>`
    *   *Note:* `/i/*` is also supported as a legacy alias for `/l/*`.
*   **2. Server-to-Server Webhooks:**
    *   **Webhook Route:** `POST /api/webhooks/supplier/:supplierId`
*   **Action:** The backend finds the matching transaction by `transactionToken` (or `uid`), updates the transaction status to `completed`, `terminate`, `quota_full`, or `security_term`, enqueues a `webhookQueue` job in BullMQ, and enqueues a `dashboardCacheQueue` job to rebuild analytics caches.

### Step 5: Downstream Vendor Propagation (Postback callback to Vendor)
*   **Asynchronous Worker:** Using **BullMQ** ([webhook.worker.mjs](file:///home/himanshu/Desktop/survey-redirector/backend/src/workers/webhook.worker.mjs)), the backend processes queued postback jobs.
*   **Vendor Link / Macro Replacement:** The system loads the vendor's configured postback URL or status-specific URL (`completeUrl`, `terminateUrl`, `quotaFullUrl`, `securityTermUrl`) and replaces macros such as `{{vendor_rid}}` and `{{status}}`.
*   **Action:** The worker sends an HTTP GET request to this postback URL to credit the vendor and close the transaction loop.

---

# 3. Administrative Control Capabilities

Through the frontend dashboard, administrators can configure:
*   **Suppliers**: Companies supplying surveys.
*   **Vendors**: Traffic providers supplying respondents, configured with their downstream `postbackUrl` matching the `{{vendor_rid}}` and `{{status}}` macros.
*   **Surveys**:
    *   **Base URL**: Configured with the placeholder `[identifier]` to encode unique transaction tokens.
    *   **Eligibility Rules**: Custom key-value pairs (e.g. `{"age": 25, "gender": "male"}`) dynamically evaluated by the screener.
    *   **Vendor Hashed Links**: Under `vendorLinks`, a survey can generate multiple secure vendor hashes (each with a set quota), giving each vendor a unique entryway link (`/r/:hash`).