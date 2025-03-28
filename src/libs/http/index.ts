import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  timeout: 10_000,
});

// TODO: Configure interceptors
