import { Component } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet,FooterComponent, RouterModule],
  templateUrl: './public-layout.component.html',
  styles: ``
})
export class PublicLayoutComponent {
  isAuthRoute: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isAuthRoute = this.router.url.includes('/auth/');
    });
  }
}
