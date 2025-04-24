import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Toast } from 'primeng/toast';
import { FooterComponent } from "../../footer/footer.component";

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, RouterLink, Toast, FooterComponent],
  templateUrl: './default-layout.component.html',
  styles: ``
})
export class DefaultLayoutComponent {
  #authService = inject(AuthService);
  #router = inject(Router);


  logout() {
    this.#authService.logout();
    this.#router.navigate(['/auth/login']);
  }
}
