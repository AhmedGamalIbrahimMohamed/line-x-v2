import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { apiErrorMessage } from '../core/admin-api.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly isSubmitting = signal(false);
  readonly error = signal('');

  submit(): void {
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set('');

    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: (error) => {
        this.isSubmitting.set(false);
        this.error.set(apiErrorMessage(error, 'Could not sign in.'));
      },
    });
  }
}
