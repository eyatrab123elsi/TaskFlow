import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User, CreateUserRequest, UpdateUserRequest,
  ChangePasswordRequest, ProfileUpdateRequest, UserFilters, Role
} from '../models/user.model';
import { DashboardStats, PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(filters: UserFilters): Observable<PageResponse<User>> {
    let params = new HttpParams()
      .set('page', filters.page)
      .set('size', filters.size)
      .set('sort', filters.sort)
      .set('direction', filters.direction);

    if (filters.search)               params = params.set('search', filters.search);
    if (filters.role != null)         params = params.set('role', filters.role);
    if (filters.enabled != null)      params = params.set('enabled', String(filters.enabled));

    return this.http.get<PageResponse<User>>(this.base, { params });
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/stats`);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  create(payload: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.base, payload);
  }

  update(id: number, payload: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggleStatus(id: number): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}/toggle-status`, {});
  }

  updateRole(id: number, role: Role): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}/role`, null, {
      params: new HttpParams().set('role', role)
    });
  }

  uploadAvatar(id: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<User>(`${this.base}/${id}/avatar`, formData);
  }

  changePassword(id: number, payload: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/password`, payload);
  }

  // Profile endpoints
  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/profile`);
  }

  updateProfile(payload: ProfileUpdateRequest): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/profile`, payload);
  }

  uploadProfileAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<User>(`${environment.apiUrl}/profile/avatar`, formData);
  }

  changeProfilePassword(payload: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/profile/password`, payload);
  }

  getAvatarUrl(filename: string | undefined): string | null {
    return filename ? `${environment.uploadsUrl}/${filename}` : null;
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
