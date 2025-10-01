// API Configuration with environment variable support
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '5001';
const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST || 'localhost';

export const BASE_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/api/`;
export const LOGIN = "auth/login";
export const LOGOUT = "auth/logout";
export const STORE_ID = "";