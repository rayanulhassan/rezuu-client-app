import { Component, inject } from '@angular/core';
import { PricingService } from '../../../shared/services/pricing.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  imports: [],
  templateUrl: './payment-success.component.html',
  styles: ``,
})
export class PaymentSuccessComponent {
  #pricingService = inject(PricingService);
  #route = inject(ActivatedRoute);

  ngOnInit() {
    this.#pricingService
      .handlePaymentSuccess(this.#route.snapshot.queryParams['session_id'])
      .subscribe((res: any) => {
        console.log(res.session.payment_status);
      });
  }
}
