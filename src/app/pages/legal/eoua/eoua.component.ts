import { Component } from '@angular/core';

@Component({
  selector: 'app-eoua',
  standalone: true,
  imports: [],
  templateUrl: './eoua.component.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
  `]
})
export class EouaComponent {
  lastUpdated = 'April 24, 2025';
} 