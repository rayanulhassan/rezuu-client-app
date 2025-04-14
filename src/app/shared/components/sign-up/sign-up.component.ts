import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Credentials } from '../../interfaces/auth.interface';
import { switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styles: ``
})
export class SignUpComponent {
  #authService = inject(AuthService);
  #router = inject(Router);
  form = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  signUp() {
    if(!this.form.valid) return;
    this.#authService.signUp(this.form.value as Credentials).pipe(
      switchMap(() => this.#authService.login(this.form.value as Credentials))
    ).subscribe({
      next: () => {
        this.#router.navigate(['/my/profile']);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}