import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Credentials } from '../../interfaces/auth.interface';
import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sign-in',
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, FormsModule, JsonPipe],
  templateUrl: './sign-in.component.html',
  styles: ``
})
export class SignInComponent {
  #authService = inject(AuthService);
  #router = inject(Router);


  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  signIn() {
    if(!this.form.valid) return;
    this.#authService.login(this.form.value as Credentials).subscribe({
      next: () => {
        this.#router.navigate(['/my/profile']);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
