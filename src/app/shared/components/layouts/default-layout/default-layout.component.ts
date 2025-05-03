import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Toast } from 'primeng/toast';
import { FooterComponent } from "../../footer/footer.component";
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toast, FooterComponent],
  templateUrl: './default-layout.component.html',
  styles: ``
})
export class DefaultLayoutComponent {
  #authService = inject(AuthService);
  #router = inject(Router);
  #userService = inject(UserService);

  userDetails = this.#userService.userDetails;
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleNavigation() {
    this.isMenuOpen = false;
  }

  logout() {
    this.#authService.logout();
    this.#router.navigate(['/auth/login']);
  }
}
