export const environment = {
  firebase_config: {
    projectId: 'rezuu-8a4c9',
    appId: '1:874346793605:web:c06142c4a6f41f018ef7ec',
    storageBucket: 'rezuu-8a4c9.appspot.com',
    apiKey: 'AIzaSyC60ptrrzka61FD-hY0FSfFctjDUWCCWJs',
    authDomain: 'rezuu-8a4c9.firebaseapp.com',
    messagingSenderId: '874346793605',
    measurementId: 'G-JHH3RZXW55',
  },
  production: false,
  useEmulators: true,
  // couldFunctionUrl: 'https://generatepresignedurl-tvzohlad2q-uc.a.run.app',
  couldFunctionUrl: 'https://us-central1-tintto-15ef9.cloudfunctions.net',
  bucketUrl: 'https://rezuu-assets.tor1.cdn.digitaloceanspaces.com/',
  stripe: {
    publicKey:
      'pk_live_YLhiTzd8d8TLBoLfQzCs3sQX00Ebeo3vMe',
    products: {
      videoSection: {
        monthly: {
          priceId: 'price_1RQzFTBA9N9fUzabXhk4xsAU',
          price: 1,
        },
        yearly: {
          priceId: 'price_1RQzFTBA9N9fUzabC9ZK57QQ',
          price: 9.6,
        },
      },
      whoViewedProfile: {
        monthly: {
          priceId: 'price_1RQzFPBA9N9fUzaby6K3ZqpQ',
          price: 1,
        },
        yearly: {
          priceId: 'price_1RQzFPBA9N9fUzabPlHBWsHI',
          price: 9.6,
        },
      },
      valueBundle: {
        monthly: {
          priceId: 'price_1RQzFLBA9N9fUzabBkhnwkGO',
          price: 5,
        },
        yearly: {
          priceId: 'price_1RQzFLBA9N9fUzabAYILZFEf',
          price: 48,
        },
      },
    },
  },
};
