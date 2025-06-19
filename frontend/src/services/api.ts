import axios from 'axios';
import { 
  LoginResponse, 
  RegisterResponse, 
  User, 
  License, 
  DashboardStats,
  LicenseFormData
} from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API calls
export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string, role: string): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', { username, email, password, role });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  }
};

// License API calls
export const licenseApi = {
  getAllLicenses: async (): Promise<License[]> => {
    const response = await api.get<License[]>('/licenses');
    return response.data;
  },

  getLicenseById: async (id: number): Promise<License> => {
    const response = await api.get<License>(`/licenses/${id}`);
    return response.data;
  },

  createLicense: async (licenseData: LicenseFormData): Promise<License> => {
    const formData = new FormData();
    
    // Add all text fields to form data
    Object.entries(licenseData).forEach(([key, value]) => {
      if (key !== 'licenseFile' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // Add file if it exists
    if (licenseData.licenseFile) {
      formData.append('licenseFile', licenseData.licenseFile);
    }
    
    const response = await api.post<{ message: string, license: License }>('/licenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.license;
  },

  updateLicense: async (id: number, licenseData: Partial<LicenseFormData>): Promise<License> => {
    const formData = new FormData();
    
    // Add all text fields to form data
    Object.entries(licenseData).forEach(([key, value]) => {
      if (key !== 'licenseFile' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // Add file if it exists
    if (licenseData.licenseFile) {
      formData.append('licenseFile', licenseData.licenseFile);
    }
    
    const response = await api.put<{ message: string, license: License }>(`/licenses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.license;
  },

  deleteLicense: async (id: number): Promise<void> => {
    await api.delete(`/licenses/${id}`);
  },

  getExpiringLicenses: async (days: number = 30): Promise<License[]> => {
    const response = await api.get<License[]>(`/licenses/alerts/expiring?days=${days}`);
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/licenses/dashboard/stats');
    return response.data;
  },

  searchLicenses: async (
    search?: string, 
    expirationStart?: string, 
    expirationEnd?: string, 
    licenseType?: string, 
    contactEmail?: string
  ): Promise<License[]> => {
    let url = '/licenses?';
    
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (expirationStart) url += `expirationStart=${expirationStart}&`;
    if (expirationEnd) url += `expirationEnd=${expirationEnd}&`;
    if (licenseType) url += `licenseType=${encodeURIComponent(licenseType)}&`;
    if (contactEmail) url += `contactEmail=${encodeURIComponent(contactEmail)}&`;
    
    const response = await api.get<License[]>(url);
    return response.data;
  }
};

export default api;
