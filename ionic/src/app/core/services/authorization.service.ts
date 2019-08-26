import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { ToastController, NavController, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable, EMPTY, from, Subject } from 'rxjs';
import { tap, mapTo, switchMap, catchError } from 'rxjs/operators';

import { User } from '../models/user';

import { AppConfig, STORAGE_USER_KEY } from './app-config';
import { LoginDTO } from './dto/login-dto';
import { LoadingService } from './loading.service';

const STORAGE_CREDENTIALS_KEY = 'credentials';

/**
 * Used for authorization needs
 */
@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  /** Current username */
  public username$ = new Subject<string>();

  public constructor(
    private http: HttpClient,
    private config: AppConfig,
    private storage: Storage,
    private toastController: ToastController,
    private navController: NavController,
    private faio: FingerprintAIO,
    private menu: MenuController,
    private loadingService: LoadingService,
  ) {
    this.storage
      .get(STORAGE_USER_KEY)
      .then(user => this.username$.next(user ? user.email : ''));
  }

  private mapUser(user: LoginDTO): User {
    return new User({
      displayName: user.email,
      email: user.email,
      idToken: user.idToken,
      refreshToken: user.refreshToken,
    });
  }
  /**
   * loginWithEmail
   * Gets the authorization token from the server
   */
  public loginWithEmail(email: string, password: string): Observable<void> {
    const url = new URL(this.config.loginURL);
    this.loadingService.startLoading('Logging in...');
    return this.http
      .post<LoginDTO>(url.toString(), {
        email: email,
        password: password,
        returnSecureToken: true,
      })
      .pipe(
        switchMap(result => {
          const user = this.mapUser(result);
          this.username$.next(user.email);
          this.storage.set(STORAGE_CREDENTIALS_KEY, { email, password });
          return from(
            this.storage.set(STORAGE_USER_KEY, {
              localId: user.localId,
              email: user.email,
              idToken: user.idToken,
              refreshToken: user.refreshToken,
            }),
          );
        }),
        tap(() => {
          this.navController.navigateRoot('films').then(() => {
            this.loadingService.stopLoading();
          });
          this.menu.enable(true);
        }),
        catchError(async error => {
          const toast = await this.toastController.create({
            message: error.error.error.message,
            duration: 2000,
          });
          toast.present();
          return EMPTY;
        }),
        switchMap(() => EMPTY),
      );
  }

  /** Try to authorize with fingerprint, else send to login page */
  public async tryFingerprintAuth(): Promise<void> {
    return this.storage.get(STORAGE_CREDENTIALS_KEY).then(credentials => {
      if (credentials) {
        return this.faio.isAvailable().then(() =>
          this.faio
            .show({
              clientId: 'StarWars',
              clientSecret: 'dimas-fucker',
              disableBackup: true,
              localizedFallbackTitle: 'Use Pin',
              localizedReason: 'Please authenticate',
            })
            .then(() => {
              return this.loginWithEmail(
                credentials.email,
                credentials.password,
              ).toPromise();
            })
            .catch(() => {
              this.storage.remove(STORAGE_CREDENTIALS_KEY);
            }),
        );
      }
      return Promise.resolve();
    });
  }

  /**
   * Request for token refreshing
   */
  public refreshToken(): Observable<void> {
    const url = new URL(this.config.refreshTokenURL);
    return from(this.storage.get(STORAGE_USER_KEY)).pipe(
      switchMap((user: User) =>
        this.http
          .post(url.toString(), {
            grant_type: 'refresh_token',
            refresh_token: user.refreshToken,
          })
          .pipe(
            switchMap(result =>
              from(
                this.storage.set(STORAGE_USER_KEY, {
                  ...user,
                  idToken: result['id_token'],
                  refreshToken: result['refresh_token'],
                }),
              ),
            ),
          ),
      ),
      mapTo(null),
    );
  }

  /** Log out */
  public logOut(): Observable<void> {
    this.storage.remove(STORAGE_CREDENTIALS_KEY);
    return from(this.storage.remove(STORAGE_USER_KEY)).pipe(
      tap(() => {
        this.navController.navigateRoot('login');
        this.menu.close();
        this.menu.enable(false);
      }),
    );
  }
}