import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginDTO } from './dto/login';
import { AppStateService } from './app-state.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../environments/environment';

/**
 * Used for authorization needs
 */
@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  public constructor(
    private http: HttpClient,
    private appStateService: AppStateService,
    private router: Router,
    private config: AppConfig
  ) {}
  /**
   * loginWithEmail
   * Gets the authorization token from the server
   */
  public loginWithEmail(email: string, password: string): Observable<LoginDTO> {
    this.appStateService.startLoading();
    const url = new URL(this.config.loginUrl + this.config.apiKey);
    return this.http
      .post<LoginDTO>(url.toString(), {
        email: email,
        password: password,
        returnSecureToken: true
      })
      .pipe(
        tap(
          (result) => {
            localStorage.idToken = result.idToken;
            localStorage.refreshToken = result.refreshToken;
            this.router.navigateByUrl('');
          },
          (error) => {
            console.log(error);
            this.appStateService.stopLoading();
          }
        )
      );
  }

  /**
   * Request for token refreshing
   */
  public refreshToken(): Observable<any> {
    this.appStateService.startLoading();
    const url = new URL(this.config.refreshTokenUrl + this.config.apiKey);
    return this.http
      .post(url.toString(), {
        grant_type: 'refresh_token',
        refresh_token: localStorage.refreshToken
      })
      .pipe(
        tap((result) => {
          localStorage.idToken = result.id_token;
          localStorage.refreshToken = result.refresh_token;
        })
      );
  }
}
