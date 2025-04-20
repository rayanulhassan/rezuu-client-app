import { inject, Injectable } from '@angular/core';
import { filter, from, map, switchMap, catchError, EMPTY, of, tap } from 'rxjs';
import { Credentials } from '../interfaces/auth.interface';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { authState } from '@angular/fire/auth';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AUTH, FIRESTORE } from '../../app.config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #auth = inject(AUTH);
  private firestore = inject(FIRESTORE);

  private user$ = authState(this.#auth);
  private isInitialized = signal(false);

  // selectors
  user = toSignal(this.user$, { initialValue: null });

  userDetails = toSignal(
    toObservable(this.user).pipe(
      switchMap((user) => {
        if (!user) return of(null);
        return this.getUser(user.uid);
      })
    )
  );

  
  // Common method to handle post-authentication navigation
  handlePostAuthNavigation(router: Router, navigateTo: string) {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait time
    const checkUser = setInterval(() => {
      attempts++;
      if (this.user()) {
        clearInterval(checkUser);
        router.navigate([navigateTo]).catch((error) => {
          console.error('Navigation error:', error);
        });
      } else if (attempts >= maxAttempts) {
        clearInterval(checkUser);
        console.error('Navigation timeout: Auth state not updated in time');
        router.navigate(['/auth/login']).catch((error) => {
          console.error('Navigation error:', error);
        });
      }
    }, 100);
  }

  constructor() {
    // Initialize auth state
    this.user$.subscribe({
      next: () => {
        this.isInitialized.set(true);
      },
      error: (error) => {
        console.error('Auth state initialization error:', error);
        this.isInitialized.set(true); // Still set initialized to true to prevent infinite waiting
      },
    });
  }

  // Method to check if auth is initialized
  isAuthInitialized() {
    return this.isInitialized();
  }

  login(credentials: Credentials) {
    return from(
      signInWithEmailAndPassword(
        this.#auth,
        credentials.email,
        credentials.password
      )
    ).pipe(
      catchError((error) => {
        let errorMessage = 'An error occurred during sign in.';

        switch (error.code) {
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          case 'auth/network-request-failed':
            errorMessage =
              'Network error. Please check your internet connection';
            break;
          default:
            console.error('Sign in error:', error);
        }

        alert(errorMessage);
        return EMPTY;
      })
    );
  }

  logout() {
    signOut(this.#auth);
  }

  signUp(body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return from(
      createUserWithEmailAndPassword(this.#auth, body.email, body.password)
    ).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return from(
          setDoc(userDocRef, {
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
          })
        );
      }),
      catchError((error) => {
        let errorMessage = 'An error occurred during sign up.';

        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage =
              'This email is already registered. Please try logging in or use a different email.';
            break;
          case 'auth/invalid-email':
            errorMessage =
              'The email address is invalid. Please enter a valid email.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage =
              'Email/password accounts are not enabled. Please contact support.';
            break;
          case 'auth/weak-password':
            errorMessage =
              'The password is too weak. Please use a stronger password.';
            break;
          case 'auth/network-request-failed':
            errorMessage =
              'Network error. Please check your internet connection.';
            break;
          default:
            console.error('Signup error:', error);
        }

        alert(errorMessage);
        return EMPTY;
      })
    );
  }

  getUser(uid: string) {
    const userDocRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userDocRef)).pipe(map((doc) => doc.data()));
  }
}
