import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Credentials } from '../../interfaces/auth.interface';
import { switchMap } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, FormsModule, CheckboxModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styles: ``
})
export class SignUpComponent {
  #authService = inject(AuthService);
  #router = inject(Router);

  showPassword = false;
  showConfirmPassword = false;
  isLoading = signal(false);

  form = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    acceptTerms: new FormControl(false, [Validators.requiredTrue])
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  signUp() {
    if(!this.form.valid) return;
    this.isLoading.set(true);
    this.#authService.signUp(this.form.value as {email: string, password: string, firstName: string, lastName: string}).pipe(
      switchMap(() => this.#authService.login(this.form.value as Credentials))
    ).subscribe({
      next: () => {
        setTimeout(() => {
          this.#router.navigate(['/my/profile']);
        }, 100);
      },
      error: (error) => {
        console.log(error);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}