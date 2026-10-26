import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '../core/admin-api.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-account',
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
})
export class AdminAccount {
  readonly auth = inject(AuthService);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  readonly isSaving = signal(false);
  readonly message = signal('');
  readonly messageType = signal<'success' | 'error'>('success');

  submit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.show('The new passwords do not match.', 'error');
      return;
    }

    this.isSaving.set(true);
    this.message.set('');

    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.currentPassword = this.newPassword = this.confirmPassword = '';
        this.show('Password updated.', 'success');
      },
      error: (error) => {
        this.isSaving.set(false);
        this.show(apiErrorMessage(error, 'Could not update the password.'), 'error');
      },
    });
  }

  private show(text: string, type: 'success' | 'error'): void {
    this.message.set(text);
    this.messageType.set(type);
  }
}
