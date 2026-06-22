

---

### Step 1: Create a Test Vendor (For Webhook Callbacks)
First, you need to set up a Vendor that points to our local mock receiver so we can listen to the callbacks we fire back to them.

1. Go to the Admin Dashboard (usually `http://localhost:3000/admin`).
2. Add a new **Vendor**:
   - **Name**: `Test Vendor`
   - **Complete URL**: `http://localhost:5000/mock-vendor-callback/complete?vendor_rid={{vendor_rid}}`
   - **Terminate URL**: `http://localhost:5000/mock-vendor-callback/terminate?vendor_rid={{vendor_rid}}`
   - **Quota Full URL**: `http://localhost:5000/mock-vendor-callback/quotafull?vendor_rid={{vendor_rid}}`
   - **Security Term URL**: `http://localhost:5000/mock-vendor-callback/securityterm?vendor_rid={{vendor_rid}}`

*(Note: The `{{vendor_rid}}` macro is automatically replaced with the participant's Vendor RID during callback propagation. Since each status has a dedicated endpoint, the `{{status}}` macro is no longer needed).*

---

### Step 2: Create a Test Supplier
Next, create a supplier.
1. Add a new **Supplier**:
   - **Name**: `Test Supplier`

---

### Step 3: Create the Test Survey
Now, we create a survey using the special `/mock-supplier` URL to simulate a supplier survey landing page.

1. Click **Create Survey**:
   - **Survey Name**: `Test E2E Survey`
   - **Project ID**: `PROJ-TEST-01`
   - **Supplier**: Select `Test Supplier`
   - **Status**: `Active`
   - **Base Supplier URL**: `http://localhost:5000/mock-supplier?uid=[identifier]&pid=PROJ-TEST-01` 
     *(Note: Keep `[identifier]` exactly as is; it will be replaced automatically by the backend with a unique transaction token).*
2. Under **Eligibility Rules**, click **Add Rule** and enter:
   - **Field**: `gender` | **Value**: `Male`
   - **Field**: `age` | **Value**: `25`
3. Under **Vendor Links**, click **Add Vendor**:
   - Select **Test Vendor** and give it a quota of `100`.
4. Click **Create Survey** to save it.

---

### Step 4: Run the End-to-End Tests

#### Test Case A: Failing the Screener (Screen Out)
1. Go to your **Surveys** page, click on `Test E2E Survey` to open the details page, and **copy the generated Vendor Redirect Link** for *Test Vendor*. It will look like this:
   `http://localhost:3000/r/YOUR_SURVEY_HASH?vendor_rid=USER_999`
2. Paste this link into your browser.
3. The page will redirect you to the Screener: `http://localhost:3000/screener/YOUR_SURVEY_HASH?vendor_rid=USER_999`.
4. Fill out the screener answers incorrectly:
   - **Gender**: `Female`
   - **Age**: `30`
5. Click **Continue to Survey**.
6. **Result**: The screener will block you with *"Sorry, you do not qualify for this survey"*.
7. If you check your Admin Dashboard under **Transactions**, you will see a new transaction with status `screened_out` for `USER_999`.

---

#### Test Case B: Succeeding the Screener & Simulating a Completion (Success Flow)
1. Paste the vendor redirect link in your browser again:
   `http://localhost:3000/r/YOUR_SURVEY_HASH?vendor_rid=USER_999`
2. On the screener page, enter the correct values to qualify:
   - **Gender**: `Male`
   - **Age**: `25`
3. Click **Continue to Survey**.
4. **Result**: The backend generates a secure `transactionToken` (UUID), creates a transaction with status `started`, and redirects you to the mock supplier page:
   `http://localhost:5000/mock-supplier?uid=SOME-UUID-HERE&pid=PROJ-TEST-01`
5. On this mock landing page, you will see the details of the transaction and four action buttons:
   - **Complete (100% OK)**
   - **Screen Out (Terminate)**
   - **Quota Full**
   - **Security Term**
6. Click **Complete (100% OK)**.
7. **Result**: 
   - You are redirected back to our backend bridge: `/l/complete?uid=SOME-UUID-HERE&pid=PROJ-TEST-01`.
   - The backend changes the transaction status in the database to `completed`.
   - An asynchronous background event (`propagate-webhook` in Agenda) is fired.
   - It sends the callback to the vendor's configured **Complete URL** via: `http://localhost:5000/mock-vendor-callback/complete?vendor_rid=USER_999`.

8. **Verification**: 
   - Check your **backend terminal logs**. You should see the mock vendor callback printing the following output when receiving the callback:
     ```text
     [Mock Vendor Callback] Webhook trigger successfully received!
       └─ Vendor RID: USER_999
       └─ Simulated Status Endpoint: Complete
       └─ Timestamp: 2026-06-22T04:16:34Z
     ```
   - Go to your Admin Dashboard under **Transactions**. You will see the transaction status updated to `completed` with a completion timestamp.

---

#### Test Case C: Simulating a Termination, Quota Full, or Security Term Outcome
You can follow the exact same steps in Test Case B, but choose one of the other three outcome buttons on the mock supplier survey landing page:

1. **Screen Out (Terminate)**:
   - Click the **Screen Out (Terminate)** button.
   - Redirects to `/l/terminate?uid=SOME-UUID-HERE&pid=PROJ-TEST-01`.
   - Fires a callback to the configured **Terminate URL**: `http://localhost:5000/mock-vendor-callback/terminate?vendor_rid=USER_999`.
   - Backend terminal logs:
     ```text
     [Mock Vendor Callback] Webhook trigger successfully received!
       └─ Vendor RID: USER_999
       └─ Simulated Status Endpoint: Terminate
       └─ Timestamp: 2026-06-22T04:16:34Z
     ```

2. **Quota Full**:
   - Click the **Quota Full** button.
   - Redirects to `/l/quotafull?uid=SOME-UUID-HERE&pid=PROJ-TEST-01`.
   - Fires a callback to the configured **Quota Full URL**: `http://localhost:5000/mock-vendor-callback/quotafull?vendor_rid=USER_999`.
   - Backend terminal logs:
     ```text
     [Mock Vendor Callback] Webhook trigger successfully received!
       └─ Vendor RID: USER_999
       └─ Simulated Status Endpoint: Quota Full
       └─ Timestamp: 2026-06-22T04:16:34Z
     ```

3. **Security Term**:
   - Click the **Security Term** button.
   - Redirects to `/l/securityterm?uid=SOME-UUID-HERE&pid=PROJ-TEST-01`.
   - Fires a callback to the configured **Security Term URL**: `http://localhost:5000/mock-vendor-callback/securityterm?vendor_rid=USER_999`.
   - Backend terminal logs:
     ```text
     [Mock Vendor Callback] Webhook trigger successfully received!
       └─ Vendor RID: USER_999
       └─ Simulated Status Endpoint: Security Term
       └─ Timestamp: 2026-06-22T04:16:34Z
     ```