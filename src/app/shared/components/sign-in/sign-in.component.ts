import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Credentials } from '../../interfaces/auth.interface';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styles: ``
})
export class SignInComponent {
  #authService = inject(AuthService);
  #router = inject(Router);

  isLoading = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  signIn() {
    if(!this.form.valid) return;
    this.isLoading.set(true);
    
    this.#authService.login(this.form.value as Credentials).subscribe({
      next: () => {
        this.#router.navigate(['/my/profile']);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
