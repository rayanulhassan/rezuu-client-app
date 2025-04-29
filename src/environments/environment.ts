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
  production: true,
  useEmulators: false,
  couldFunctionUrl: 'https://us-central1-tintto-15ef9.cloudfunctions.net',
  bucketUrl: 'https://rezuu-assets.tor1.cdn.digitaloceanspaces.com/',
  stripe: {
    publicKey:
      'pk_test_51GsMuoBA9N9fUzabjY3YQmznUSetBEO8xRx2B2Q3KatWZtwtTQIYAAA96ewZqn0RMuzeLS7AufGL9PaQsfVGMnZl004tQaaFpQ',
    products: {
      videoSection: {
        monthly: {
          priceId: 'price_1RIx6pBA9N9fUzabWuxgodmx',
          price: 1,
        },
        yearly: {
          priceId: 'price_1RIx6pBA9N9fUzabeNqGl0h9',
          price: 9.6,
        },
      },
      whoViewedProfile: {
        monthly: {
          priceId: 'price_1RIx7WBA9N9fUzabEx5niB8w',
          price: 1,
        },
        yearly: {
          priceId: 'price_1RIx7vBA9N9fUzabqLSeuw7c',
          price: 9.6,
        },
      },
      valueBundle: {
        monthly: {
          priceId: 'price_1RIx9YBA9N9fUzabuBspp8Vn',
          price: 5,
        },
        yearly: {
          priceId: 'price_1RIx9YBA9N9fUzabZQqagozR',
          price: 38.4,
        },
      },
    },
  },
};
