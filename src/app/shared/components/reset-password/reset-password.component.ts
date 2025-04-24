import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AUTH } from '../../../app.config';
import { confirmPasswordReset } from 'firebase/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styles: ``
})
export class ResetPasswordComponent {
  #auth = inject(AUTH);
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  
  isLoading = signal(false);
  showPassword = false;
  showConfirmPassword = false;

  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  resetPassword() {
    if (!this.form.valid) return;
    
    this.isLoading.set(true);
    const oobCode = this.#route.snapshot.queryParams['oobCode'];
    const newPassword = this.form.get('password')?.value;

    if (!oobCode) {
      alert('Invalid or expired reset link. Please request a new password reset.');
      this.#router.navigate(['/auth/forgot-password']);
      return;
    }

    confirmPasswordReset(this.#auth, oobCode, newPassword!)
      .then(() => {
        alert('Password has been reset successfully!');
        this.#router.navigate(['/auth/login']);
      })
      .catch((error) => {
        let errorMessage = 'An error occurred while resetting your password.';

        switch (error.code) {
          case 'auth/expired-action-code':
            errorMessage = 'The password reset link has expired. Please request a new one.';
            break;
          case 'auth/invalid-action-code':
            errorMessage = 'The password reset link is invalid. Please request a new one.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak. Please use a stronger password.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            console.error('Password reset error:', error);
        }

        alert(errorMessage);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
