import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
@Component({
  selector: 'app-empty-layout',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './empty-layout.component.html',
  styles: ``
})
export class EmptyLayoutComponent {

}
