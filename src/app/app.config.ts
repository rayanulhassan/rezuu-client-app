import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { RezuuPreset } from './rezuu-primeng-preset';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

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
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'rezuu-8a4c9',
        appId: '1:874346793605:web:c06142c4a6f41f018ef7ec',
        storageBucket: 'rezuu-8a4c9.appspot.com',
        apiKey: 'AIzaSyC60ptrrzka61FD-hY0FSfFctjDUWCCWJs',
        authDomain: 'rezuu-8a4c9.firebaseapp.com',
        messagingSenderId: '874346793605',
        measurementId: 'G-JHH3RZXW55',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
