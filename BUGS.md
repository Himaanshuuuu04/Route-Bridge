# Recent Commits Analysis Report

## Executive Summary
This report details the findings from an analysis of the last two commits (`19579354` and `e2087d6`) in the `survey-redirector` repository. While the commits introduce valuable caching mechanisms and UI improvements, they also introduce several bugs ranging from critical server crashes to logical UI inconsistencies. 

Below is a categorized breakdown of all potential errors and bugs these commits can cause over time.

---

## 1. Critical Backend & Stability Bugs

### 1.1 Redis "Maximum Call Stack Size Exceeded" Crash
- **Location**: `backend/src/workers/dashboardCache.worker.mjs` & `backend/src/controllers/dashboard.controller.mjs`
- **Description**: The code uses JavaScript spread syntax to delete keys from Redis: `await redisConnection.del(...userKeys)`. The V8 engine limits the maximum number of arguments a function can take (typically around 10,000). As the system accumulates thousands of user profile keys or dashboard keys, spreading them into the `del()` function will throw a `RangeError: Maximum call stack size exceeded` and completely crash the Node.js process.
- **Impact**: The cache rebuild worker will fail, leading to permanently stale cache data and broken background jobs.
- **Fix**: `ioredis` natively supports passing an array to `del()`. Remove the spread operator: `await redisConnection.del(userKeys);`

### 1.2 Redis `KEYS` Blocking Command in Production
- **Location**: `backend/src/workers/dashboardCache.worker.mjs`
- **Description**: The scheduled worker uses `redisConnection.keys('user:profile:*')` every 30 minutes. `KEYS` is a blocking O(N) command that freezes the Redis server from processing other operations while it scans the entire keyspace.
- **Impact**: This will cause severe latency spikes across the entire application every 30 minutes as the user base grows.
- **Fix**: Use the `SCAN` command to iteratively find keys without blocking the Redis event loop, or maintain a Redis Set of active user cache keys.

---

## 2. High-Severity Logic & UI Bugs

### 2.1 Survey Template Status Override Bug
- **Location**: `backend/src/helpers/template.mjs`
- **Description**: The refactored HTML survey template hardcodes its fallback `statusConfig` to "Complete" (with a "Survey Completed" title). The original code used a fallback color but preserved the raw `status` text. 
- **Impact**: Any survey ending with an unhandled status (e.g., `started`, `screened_out`, `fraud`) will now misleadingly display as "Survey Completed" to the end user. This will lead to major confusion and support tickets regarding survey incentive payouts.
- **Fix**: Update the fallback configuration to dynamically render the actual status value provided in the function arguments.

### 2.2 Cache Chronological Ordering Broken (`lpush`)
- **Location**: `backend/src/workers/dashboardCache.worker.mjs`
- **Description**: In the `updateEntry` function, when a transaction's status is updated, it is pushed to the new status cache list using `redisConnection.lpush()`. This action places the transaction at the *very top* of the list.
- **Impact**: The "Recent Surveys" dashboard is expected to be sorted by `createdAt` descending. If an older survey changes status today, it will incorrectly jump to the top of the cache, overriding the chronological integrity of the dashboard.

### 2.3 Broken Native Browser Reload UX
- **Location**: `frontend/components/dashboard/DashboardShortcuts.tsx`
- **Description**: The `handleKeyDown` function aggressively intercepts `Ctrl+R` and `Cmd+R` globally across the dashboard, using `e.preventDefault()` to trigger an RTK Query refetch instead.
- **Impact**: Users are prevented from natively hard-refreshing their browser tab using standard shortcuts. This severely degrades UX when users actually need to reload the page to fetch a new JS bundle or recover from a browser issue.
- **Fix**: Use a non-conflicting shortcut (e.g., `Alt+R`) or remove `e.preventDefault()`.

---

## 3. Medium & Minor Bugs

### 3.1 404 Error on Logout Redirect
- **Location**: `frontend/app/dashboard/settings/page.tsx`
- **Description**: The `handleLogout` function redirects users to `/auth/signin` upon successful logout. However, the codebase structure indicates the correct authentication route is `/signin`.
- **Impact**: Users will hit a 404 "Page Not Found" error immediately after logging out.
- **Fix**: Update the router push path: `router.push("/signin");`.

### 3.2 Permanent Caching of User Profiles
- **Location**: `backend/src/controllers/user.controller.mjs`
- **Description**: The 10-minute TTL (`'EX', 600`) was removed from the user profile cache, making the cache permanent until explicitly cleared by the 30-minute cron job.
- **Impact**: If an administrator changes a user's permissions or admin access, the change will not take effect for up to 30 minutes, posing a mild security delay.
- **Fix**: Restore the TTL logic: `await redisConnection.set(cacheKey, JSON.stringify(user), 'EX', 600);`.

### 3.3 Silent Data Truncation on High Query Limits
- **Location**: `backend/src/controllers/dashboard.controller.mjs`
- **Description**: The `getRecentSurveys` function checks if the request is eligible for cache and serves up to `limit` items using `lrange`. However, the Redis list is strictly capped at 50 items during rebuilds.
- **Impact**: If the frontend requests 100 items (`limit=100`), the cache will return only 50 items, and the API will serve this truncated list without falling back to the database to fetch the remaining 50.
- **Fix**: Bypass the Redis list cache entirely if `limit > 50`.
