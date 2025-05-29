import axios, { AxiosInstance } from 'axios';
import { BASE_URL } from '../constants/api';
import { CONFIG } from '../constants/config';
let axiosInstance: AxiosInstance | null = null;

export const getAxiosInstance = (): AxiosInstance => {
    if (!axiosInstance) {
        axiosInstance = axios.create({
            baseURL: BASE_URL, // Use environment variables
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key':CONFIG.apiKey
            },
        });
        axiosInstance.interceptors.request.use(
            (config) => {
                const token = JSON.parse(localStorage.getItem('token') || 'null');
                if (token) {
                    config.headers.Authorization = token;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    if (error.response.status === 401) {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                } else {
                    console.error('Network Error:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }
    return axiosInstance;
};
