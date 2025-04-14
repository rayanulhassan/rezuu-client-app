import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'app-sign-in',
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sign-in.component.html',
  styles: ``
})
export class SignInComponent {
  form = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  signIn() {
    console.log(this.form.value);
  }
}
