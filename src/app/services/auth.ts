import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';

export interface FakeStoreUser {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly USERS_API = 'https://fakestoreapi.com/users';
  public readonly TOKEN_KEY = 'shd_token';
  public readonly USER_KEY = 'shd_usuario';

  login(usernameInput: string, passwordInput: string): Observable<boolean> {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    return this.http.get<FakeStoreUser[]>(this.USERS_API).pipe(
      map((users) => {
        const foundUser = users.find(
          (u) =>
            u.username.toLowerCase() === cleanUser &&
            u.password === cleanPass
        );

        if (foundUser) {
          this.saveSession({
            id: foundUser.id,
            username: foundUser.username,
            password: foundUser.password,
            email: foundUser.email,
            fullName: `${foundUser.name.firstname} ${foundUser.name.lastname}`,
            role: foundUser.username.toLowerCase() === 'johnd' ? 'ADMIN' : 'USER'
          });
          return true;
        }

        return false;
      }),
      catchError((err) => {
        console.error('Error conectando con FakeStoreAPI:', err);
        if (cleanUser === 'johnd' && cleanPass === 'm38rmF$') {
          this.saveSession({
            id: 1,
            username: 'johnd',
            password: cleanPass,
            email: 'john@gmail.com',
            fullName: 'john doe',
            role: 'ADMIN'
          });
          return of(true);
        }
        return of(false);
      })
    );
  }

  private saveSession(userData: {
    id: number;
    username: string;
    password: string;
    email: string;
    fullName: string;
    role: string;
  }): void {
    const token = 'token-shd-' + btoa(`${userData.username}:${Date.now()}`);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  getCurrentUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token !== null && token.length > 0;
  }
}