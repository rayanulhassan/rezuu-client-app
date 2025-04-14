import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-root',
  imports: [ButtonModule, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {}
