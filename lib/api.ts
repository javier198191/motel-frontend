import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
});

// Interceptor de Peticiones
api.interceptors.request.use(
    (config) => {
        // En cada request que haga axios, leemos el token actual
        const token = typeof window !== "undefined" ? localStorage.getItem('motel_token') : null;
        
        if (token && config.headers) {
            // Se inyecta automáticamente el token Bearer en el header de Autorización
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
