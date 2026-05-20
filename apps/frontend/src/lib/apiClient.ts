import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config;
    const status = error.response?.status;

    // Don't intercept errors from the refresh endpoint itself
    if (status === 401 && originalRequest && !originalRequest.url?.includes('/auth/refresh')) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = apiClient
          .post('/auth/refresh')
          .then(() => undefined)
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        return apiClient(originalRequest);
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
