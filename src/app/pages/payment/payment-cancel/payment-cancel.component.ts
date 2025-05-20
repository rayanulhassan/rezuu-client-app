import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './payment-cancel.component.html',
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    .payment-container {
      text-align: center;
      padding: 2rem;
    }
    .cancel-icon {
      color: #ef4444;
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .action-buttons {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
  `],
})
export class PaymentCancelComponent {
  #router = inject(Router);

  navigateToPricing() {
    this.#router.navigate(['/my/pricing-management']);
  }
}
