import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  #http = inject(HttpClient);
  #couldFunctionUrl = environment.couldFunctionUrl;
  // #couldFunctionUrl = 'http://127.0.0.1:5001/tintto-15ef9/us-central1';

  videoSectionProduct = environment.stripe.products.videoSection;
  whoViewedProfileProduct = environment.stripe.products.whoViewedProfile;
  valueBundleProduct = environment.stripe.products.valueBundle;


  makePayment(items: {price: string, quantity: number}[]) {
    return this.#http.post(`${this.#couldFunctionUrl}/createCheckoutSession`, {
      items: items,
      successUrl: `${window.location.origin}/my/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/my/payment/cancel`,
    })
  }

  handlePaymentSuccess(sessionId: string) {
    return this.#http.post(`${this.#couldFunctionUrl}/handlePaymentSuccess`, {
      sessionId: sessionId,
    })
  }
}
