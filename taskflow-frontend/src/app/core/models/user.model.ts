export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  enabled: boolean;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  enabled: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UserFilters {
  search?: string;
  role?: Role | null;
  enabled?: boolean | null;
  page: number;
  size: number;
  sort: string;
  direction: 'asc' | 'desc';
}
