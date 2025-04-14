import { Component, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {
  #authService = inject(AuthService);

  user = this.#authService.user;
}
