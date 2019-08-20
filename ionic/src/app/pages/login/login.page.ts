import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthorizationService } from '../../services/authorization.service';

/**
 * Login page
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
// tslint:disable-next-line: component-class-suffix
export class LoginPage implements OnInit, OnDestroy {
  /** Email field value */
  public email = 'test@test.test';

  /** Password field value */
  public password = '123456';

  /** Exit button subscription */
  public exitButtonSubscription$: Subscription;

  constructor(
    private authService: AuthorizationService,
    private platform: Platform,
  ) {}

  /** Login event */
  public onSubmit(event: Event): void {
    event.preventDefault();
    this.authService.loginWithEmail(this.email, this.password).subscribe();
  }
  /** @inheritdoc */
  public ngOnInit(): void {
    this.exitButtonSubscription$ = this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp();
    });
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.exitButtonSubscription$.unsubscribe();
  }
}
