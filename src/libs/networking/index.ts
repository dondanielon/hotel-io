import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  // baseURL: "https://1ab1-2806-103e-18-2cfe-ecfd-b69c-7117-c197.ngrok-free.app:3000",
  timeout: 10_000,
});

// TODO: Configure interceptors
