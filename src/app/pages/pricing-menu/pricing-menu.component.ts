import { CommonModule, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PricingService } from '../../shared/services/pricing.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
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
  ],
  templateUrl: './pricing-menu.component.html',
  styles: ``,
})
export class PricingMenuComponent {
  #pricingService = inject(PricingService);
  #videoSectionProduct = this.#pricingService.videoSectionProduct;
  #whoViewedProfileProduct = this.#pricingService.whoViewedProfileProduct;
  #valueBundleProduct = this.#pricingService.valueBundleProduct;


  readonly pricingPlanOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];
  isPaymentProcessing = signal(false);

  
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
      discountLabel: 'Save 50%',
    },
  ];


  makePayment() {
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
    this.#pricingService.makePayment(items).pipe(
      finalize(() => this.isPaymentProcessing.set(false))
    ).subscribe({
      next: (res: any) => {
        window.location.href = res.sessionUrl;
      },
      error: (err: any) => {
        alert('Error making payment');
      },
    });
  }
}
