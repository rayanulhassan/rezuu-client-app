import { Component, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { JsonPipe } from '@angular/common';
@Component({
  selector: 'app-profile',
  imports: [JsonPipe],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {
  #authService = inject(AuthService);

  user = this.#authService.user;
}
