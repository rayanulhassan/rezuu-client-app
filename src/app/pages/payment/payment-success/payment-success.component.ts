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
import { environment } from '../../../../environments/environment';

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

  // Get price IDs from environment
  readonly videoSectionPriceIds = {
    monthly: environment.stripe.products.videoSection.monthly.priceId,
    yearly: environment.stripe.products.videoSection.yearly.priceId
  };

  readonly whoViewedProfilePriceIds = {
    monthly: environment.stripe.products.whoViewedProfile.monthly.priceId,
    yearly: environment.stripe.products.whoViewedProfile.yearly.priceId
  };

  readonly valueBundlePriceIds = {
    monthly: environment.stripe.products.valueBundle.monthly.priceId,
    yearly: environment.stripe.products.valueBundle.yearly.priceId
  };

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
            const subscriptionId = res.session.subscription || null;

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
              if (priceId === this.videoSectionPriceIds.monthly || priceId === this.videoSectionPriceIds.yearly) {
                planOptions.videoSection = quantity;
              }
              // Check for who viewed profile price
              else if (priceId === this.whoViewedProfilePriceIds.monthly || priceId === this.whoViewedProfilePriceIds.yearly) {
                planOptions.whoViewedProfile = true;
              }
              // Check for value bundle price
              else if (priceId === this.valueBundlePriceIds.monthly || priceId === this.valueBundlePriceIds.yearly) {
                planOptions.videoSection = 4;
                planOptions.whoViewedProfile = true;
              }
            }

            try {
              // Update user data in Firebase
              await this.#userService.updateUserAfterPayment({
                stripeCustomerId: customerId,
                isPayingUser: true,
                planOptions,
                stripeSubscriptionId: subscriptionId
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
