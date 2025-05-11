import { CommonModule, NgClass } from '@angular/common';
import { Component, computed, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PricingService } from '../../shared/services/pricing.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { UserService } from '../../shared/services/user.service';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

interface AddOn {
  name: string;
  description?: string;
  price: number;
  selected: boolean;
  quantity?: number;
  min?: number;
  max?: number;
}

interface Bundle {
  name: string;
  features: string[];
  price: number;
  selected: boolean;
  discountLabel?: string;
}

@Component({
  selector: 'app-pricing-menu',
  imports: [
    CommonModule,
    InputSwitchModule,
    FormsModule,
    SelectButtonModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './pricing-menu.component.html',
  styles: [`
    .subscription-message {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
      color: #991b1b;
    }
    .subscription-message i {
      margin-right: 0.5rem;
    }
  `],
})
export class PricingMenuComponent {
  #pricingService = inject(PricingService);
  #userService = inject(UserService);
  #messageService = inject(MessageService);
  #videoSectionProduct = this.#pricingService.videoSectionProduct;
  #whoViewedProfileProduct = this.#pricingService.whoViewedProfileProduct;
  #valueBundleProduct = this.#pricingService.valueBundleProduct;

  readonly pricingPlanOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];
  isPaymentProcessing = signal(false);
  isPayingUser = signal(false);
  isPromoCodeLoading = signal(false);
  isCancellingSubscription = signal(false);
  promoCode = signal('');
  promoCodeDiscount = signal(0);

  pricingPlan = signal<'monthly' | 'yearly'>('monthly');

  videoSectionPrice = computed(() =>
    this.pricingPlan() === 'monthly'
      ? this.#videoSectionProduct.monthly.price
      : this.#videoSectionProduct.yearly.price
  );
  whoViewedProfilePrice = computed(() =>
    this.pricingPlan() === 'monthly'
      ? this.#whoViewedProfileProduct.monthly.price
      : this.#whoViewedProfileProduct.yearly.price
  );
  valueBundlePrice = computed(() =>
    this.pricingPlan() === 'monthly'
      ? this.#valueBundleProduct.monthly.price
      : this.#valueBundleProduct.yearly.price
  );

  isBuyingVideoSection = signal(false);
  isBuyingWhoViewedProfile = signal(false);
  isBuyingValueBundle = signal(false);

  videoSectionQuantity = signal(1);

  totalPrice = computed(() => {
    let sum: number = 0;
    if (this.isBuyingVideoSection()) {
      sum += this.videoSectionPrice() * this.videoSectionQuantity();
    }
    if (this.isBuyingWhoViewedProfile()) {
      sum += this.whoViewedProfilePrice();
    }
    if (this.isBuyingValueBundle()) {
      sum += this.valueBundlePrice();
    }
    
    // Apply promo code discount if exists
    if (this.promoCodeDiscount() > 0) {
      sum = sum * (1 - this.promoCodeDiscount() / 100);
    }
    
    return sum;
  });

  freeFeatures = [
    'Profile picture',
    'Contact info',
    'External links',
    'Resume and certificate showcase',
    'Up to 2 video sections',
  ];

  addOns: AddOn[] = [
    {
      name: 'Video Section',
      price: 1,
      selected: false,
      quantity: 1,
      min: 1,
      max: 10,
      description: '',
    },
    {
      name: 'Who Viewed my Profile?',
      price: 1,
      selected: false,
      description: '',
    },
  ];

  bundles: Bundle[] = [
    {
      name: 'Value Bundle',
      features: ['4 Video Sections', 'Who Viewed my Profile'],
      price: 5,
      selected: false,
    },
  ];

  constructor() {
    // Create an effect to watch user details changes
    effect(() => {
      const userDetails = this.#userService.userDetails();
      if (userDetails) {
        this.isPayingUser.set(!!userDetails.stripeSubscriptionId);
      }
    });
  }

  validatePromoCode() {
    if (!this.promoCode()) {
      this.#messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a promo code'
      });
      return;
    }

    this.isPromoCodeLoading.set(true);
    this.#pricingService.getPromoCodeDetails(this.promoCode()).subscribe({
      next: (response: any) => {
        if (response.valid) {
          this.promoCodeDiscount.set(response.discountPercentage);
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Promo code applied! ${response.discountPercentage}% discount`
          });
        } else {
          this.promoCodeDiscount.set(0);
          this.#messageService.add({
            severity: 'error',
            summary: 'Invalid Code',
            detail: response.message || 'Invalid promo code'
          });
        }
      },
      error: () => {
        this.promoCodeDiscount.set(0);
        this.#messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error validating promo code'
        });
      },
      complete: () => {
        this.isPromoCodeLoading.set(false);
      }
    });
  }

  makePayment() {
    if (this.isPayingUser()) {
      this.#messageService.add({
        severity: 'warn',
        summary: 'Active Subscription',
        detail: 'Please cancel your existing subscription before purchasing a new one.'
      });
      return;
    }

    const items = [];
    if (this.isBuyingVideoSection()) {
      items.push({
        price:
          this.pricingPlan() === 'monthly'
            ? this.#videoSectionProduct.monthly.priceId
            : this.#videoSectionProduct.yearly.priceId,
        quantity: this.videoSectionQuantity(),
      });
    }
    if (this.isBuyingWhoViewedProfile()) {
      items.push({
        price:
          this.pricingPlan() === 'monthly'
            ? this.#whoViewedProfileProduct.monthly.priceId
            : this.#whoViewedProfileProduct.yearly.priceId,
        quantity: 1,
      });
    }
    if (this.isBuyingValueBundle()) {
      items.push({
        price:
          this.pricingPlan() === 'monthly'
            ? this.#valueBundleProduct.monthly.priceId
            : this.#valueBundleProduct.yearly.priceId,
        quantity: 1,
      });
    }
    this.isPaymentProcessing.set(true);
    this.#pricingService.makePayment(
      items,
      this.promoCodeDiscount() > 0 ? this.promoCode() : null
    ).pipe(
      finalize(() => this.isPaymentProcessing.set(false))
    ).subscribe({
      next: (res: any) => {
        window.location.href = res.sessionUrl;
      },
      error: (err: any) => {
        this.#messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error processing payment. Please try again.'
        });
      },
    });
  }

  cancelSubscription() {
    const user = this.#userService.userDetails();
    if (!user?.stripeSubscriptionId) {
      this.#messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No active subscription found'
      });
      return;
    }

    this.isCancellingSubscription.set(true);
    this.#pricingService.cancelSubscription(user.stripeSubscriptionId, user.uid).subscribe({
      next: async () => {
        await this.#userService.onSubscriptionCancel();
        this.#messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Subscription cancelled successfully'
        });
        this.isPayingUser.set(false);
      },
      error: (error) => {
        console.error('Error cancelling subscription:', error);
        this.#messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error cancelling subscription'
        });
        this.isCancellingSubscription.set(false);
      },
      complete: () => {
        this.isCancellingSubscription.set(false);
      }
    });
  }
}
