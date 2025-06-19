// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// License types
export interface License {
  id: number;
  software_name: string;
  vendor: string;
  license_type: string;
  purchase_date: string;
  expiration_date: string;
  auto_renewal: boolean;
  contact_name: string;
  contact_email: string;
  license_key?: string;
  license_file_path?: string;
  notes?: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface LicenseFormData {
  software_name: string;
  vendor: string;
  license_type: string;
  purchase_date: string;
  expiration_date: string;
  auto_renewal: boolean;
  contact_name: string;
  contact_email: string;
  license_key?: string;
  notes?: string;
  licenseFile?: File;
}

// Dashboard types
export interface DashboardStats {
  totalLicenses: number;
  expiringLicenses: number;
  overdueLicenses: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  table_name: string;
  record_id: number;
  changes: any;
  ip_address: string;
  created_at: string;
}

// API response types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
