import axios from 'axios';
import { getCookie } from 'cookies-next';
import ApiClient from '@/lib/api-client/src/ApiClient';
import AuthApi from '@/lib/api-client/src/api/AuthApi';
import AdminConditionsApi from '@/lib/api-client/src/api/AdminConditionsApi';
import AdminContentItemsApi from '@/lib/api-client/src/api/AdminContentItemsApi';
import AdminFacultyApi from '@/lib/api-client/src/api/AdminFacultyApi';
import AdminPatientContentApi from '@/lib/api-client/src/api/AdminPatientContentApi';
import AdminSubSectionsApi from '@/lib/api-client/src/api/AdminSubSectionsApi';
import AdminTherapyAreasApi from '@/lib/api-client/src/api/AdminTherapyAreasApi';
import AdminTopicsApi from '@/lib/api-client/src/api/AdminTopicsApi';
import AdminUsersApi from '@/lib/api-client/src/api/AdminUsersApi';
import AdminWebinarsApi from '@/lib/api-client/src/api/AdminWebinarsApi';

// ─── Axios instance (used for auth refresh flow) ────────────────────────────
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest.url?.includes('/auth/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getCookie('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/refresh`,
          { refreshToken },
        );

        const { setCookie } = await import('cookies-next');
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        setCookie('authToken', data.access_token, { maxAge: THIRTY_DAYS, path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
        if (data.refresh_token) {
          setCookie('refreshToken', data.refresh_token, { maxAge: THIRTY_DAYS, path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
        }

        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        const { deleteCookie } = await import('cookies-next');
        deleteCookie('authToken', { path: '/' });
        deleteCookie('refreshToken', { path: '/' });
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Generated API client ────────────────────────────────────────────────────
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

const _origCallApi = apiClient.callApi.bind(apiClient);
apiClient.callApi = function (...args) {
  const token = getCookie('authToken');
  this.authentications['JWT-auth'] = { type: 'bearer', accessToken: token || '' };
  return _origCallApi(...args);
};

export const api = {
  auth: new AuthApi(apiClient),
  adminUsers: new AdminUsersApi(apiClient),
  adminTherapyAreas: new AdminTherapyAreasApi(apiClient),
  adminSubSections: new AdminSubSectionsApi(apiClient),
  adminTopics: new AdminTopicsApi(apiClient),
  adminContentItems: new AdminContentItemsApi(apiClient),
  adminFaculty: new AdminFacultyApi(apiClient),
  adminConditions: new AdminConditionsApi(apiClient),
  adminPatientContent: new AdminPatientContentApi(apiClient),
  adminWebinars: new AdminWebinarsApi(apiClient),
};

export { axiosInstance };
