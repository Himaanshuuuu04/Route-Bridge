import axios from 'axios';

// The backend port is usually 3000 or whatever is in .env, let's use the local API endpoint.
// In Next.js, API URL might be in an env var. We default to http://localhost:5000 based on typical backend setups or just /api if proxying.
// The backend README mentions the default port is in .env. Let's use http://localhost:5000 as a placeholder, user can override via .env.NEXT_PUBLIC_API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;
