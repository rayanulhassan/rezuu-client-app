import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AUTH } from '../../../app.config';
import { sendPasswordResetEmail } from 'firebase/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styles: ``
})
export class ForgotPasswordComponent {
  #auth = inject(AUTH);
  isLoading = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  resetPassword() {
    if (!this.form.valid) return;
    
    this.isLoading.set(true);
    const email = this.form.get('email')?.value;

    sendPasswordResetEmail(this.#auth, email!)
      .then(() => {
        alert('Password reset email sent! Please check your inbox.');
        this.form.reset();
      })
      .catch((error) => {
        let errorMessage = 'An error occurred while sending the reset email.';

        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'The email address is invalid.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later.';
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
