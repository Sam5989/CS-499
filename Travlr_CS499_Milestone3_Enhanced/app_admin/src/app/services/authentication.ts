import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../model/user';
import { AuthResponse } from '../model/auth-response';
import { TripData } from '../services/trip-data';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripData
  ) { }

  authResp: AuthResponse = new AuthResponse();

  public getToken(): string {
    return this.storage.getItem('travlr-token') ?? '';
  }

  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
  }

  public logout(): void {
    this.storage.removeItem('travlr-token');
  }

  private decodeToken(): any | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      return JSON.parse(atob(parts[1]));
    } catch {
      this.logout();
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const payload = this.decodeToken();

    if (!payload || typeof payload.exp !== 'number') {
      return false;
    }

    return payload.exp > Date.now() / 1000;
  }

  public getCurrentUser(): User {
    const payload = this.decodeToken();

    if (!payload) {
      return {} as User;
    }

    return {
      email: payload.email,
      name: payload.name
    } as User;
  }

  public login(user: User, passwd: string): void {
    this.tripDataService.login(user, passwd)
      .subscribe({
        next: (value: AuthResponse) => {
          if (value?.token) {
            this.authResp = value;
            this.saveToken(value.token);
          }
        },
        error: () => {
          this.logout();
        }
      });
  }

  public register(user: User, passwd: string): void {
    this.tripDataService.register(user, passwd)
      .subscribe({
        next: (value: AuthResponse) => {
          if (value?.token) {
            this.authResp = value;
            this.saveToken(value.token);
          }
        },
        error: () => {
          this.logout();
        }
      });
  }
}
