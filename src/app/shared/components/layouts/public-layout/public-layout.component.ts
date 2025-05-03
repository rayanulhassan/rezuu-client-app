import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet,FooterComponent, RouterModule],
  templateUrl: './public-layout.component.html',
  styles: ``
})
export class PublicLayoutComponent {

}
