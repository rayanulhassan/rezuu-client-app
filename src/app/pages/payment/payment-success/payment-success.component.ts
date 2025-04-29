import { Component, inject } from '@angular/core';
import { PricingService } from '../../../shared/services/pricing.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, CardModule, ButtonModule],
  templateUrl: './payment-success.component.html',
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
    .success-icon {
      color: #22c55e;
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .loading-text {
      margin-top: 1rem;
      color: #64748b;
    }
    .action-buttons {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
  `],
})
export class PaymentSuccessComponent {
  #pricingService = inject(PricingService);
  #route = inject(ActivatedRoute);
  #userService = inject(UserService);
  #router = inject(Router);
  #messageService = inject(MessageService);

  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  navigateToProfile() {
    this.#router.navigate(['/my/profile']);
  }

  ngOnInit() {
    this.#pricingService
      .handlePaymentSuccess(this.#route.snapshot.queryParams['session_id'])
      .subscribe({
        next: async (res: any) => {
          if (res.session.payment_status === 'paid') {
            const user = this.#userService.userDetails();
            if (!user) {
              this.errorMessage = 'User not found';
              this.isLoading = false;
              return;
            }

            const items = res.items || [];
            const customerId = res.customerId;

            // Initialize plan options
            const planOptions = {
              videoSection: 0,
              whoViewedProfile: false
            };

            // Process each item in the payment
            for (const item of items) {
              const priceId = item.priceId;
              const quantity = item.quantity;

              // Check for video section price
              if (priceId === 'price_1RIx6pBA9N9fUzabWuxgodmx' || priceId === 'price_1RIx6pBA9N9fUzabeNqGl0h9') {
                planOptions.videoSection = quantity;
              }
              // Check for who viewed profile price
              else if (priceId === 'price_1RIx7WBA9N9fUzabEx5niB8w' || priceId === 'price_1RIx7vBA9N9fUzabqLSeuw7c') {
                planOptions.whoViewedProfile = true;
              }
              // Check for value bundle price
              else if (priceId === 'price_1RIx9YBA9N9fUzabuBspp8Vn' || priceId === 'price_1RIx9YBA9N9fUzabZQqagozR') {
                planOptions.videoSection = 4;
                planOptions.whoViewedProfile = true;
              }
            }

            try {
              // Update user data in Firebase
              await this.#userService.updateUserAfterPayment({
                stripeCustomerId: customerId,
                isPayingUser: true,
                planOptions
              });

              this.isSuccess = true;
              this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment processed successfully' });
            } catch (error) {
              console.error('Error updating user data:', error);
              this.errorMessage = 'Error processing payment';
              this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error processing payment' });
            }
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error handling payment success:', error);
          this.errorMessage = 'Error processing payment';
          this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error processing payment' });
          this.isLoading = false;
        }
      });
  }
}
