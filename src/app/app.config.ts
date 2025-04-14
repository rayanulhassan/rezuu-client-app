import { ApplicationConfig, InjectionToken, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { RezuuPreset } from './rezuu-primeng-preset';
import { initializeApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth } from '@angular/fire/auth';
import { Firestore, getFirestore,initializeFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { environment } from '../environments/environment.development';


const app = initializeApp(environment.firebase_config);

export const AUTH = new InjectionToken('Firebase auth', {
  providedIn: 'root',
  factory: () => {
    const auth = getAuth();
    // if (environment.useEmulators) {
    //   connectAuthEmulator(auth, 'http://localhost:9099', {
    //     disableWarnings: true,
    //   });
    // }
    return auth;
  },
});

export const FIRESTORE = new InjectionToken('Firebase firestore', {
  providedIn: 'root',
  factory: () => {
    let firestore: Firestore;
    // if (environment.useEmulators) {
    //   firestore = initializeFirestore(app, {});
    //   connectFirestoreEmulator(firestore, 'localhost', 8080);
    // } else {
    //   firestore = getFirestore();
    // }
    return getFirestore();
  },
});




export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: RezuuPreset,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
  ],
};
