import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'app-sign-up',
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styles: ``
})
export class SignUpComponent {
  form = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  });

  signUp() {
    console.log(this.form.value);
  }
}