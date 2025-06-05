import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../services/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(
    private router: Router, 
    private http: HttpClient 
  ) {}

  saveAuthData(authData: any): void {
    localStorage.setItem('token', authData.token);

    const user = {
      id: authData.userId,
      userName: authData.userName,
      idRole: authData.roleId
    };

    localStorage.setItem('user_data', JSON.stringify(user));

    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    this.router.navigate(['']);
  }

  // Авторизация
  login(credentials: { userName: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  // Регистрация
  register(userData: {
    nickName: string;
    userName: string;
    password: string;
    confirmPassword: string;
    language: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  getCurrentUser(): any {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  getUserRole(): number {
    const user = this.getCurrentUser();
    return user?.idRole || 0;
  }
}