import { inject, Injectable } from '@angular/core';
import { filter, from, lastValueFrom, map, Observable, retry, switchMap, catchError, throwError, EMPTY } from 'rxjs';
import { Credentials, RezuuUser } from '../interfaces/auth.interface';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { authState } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { AUTH, FIRESTORE } from '../../app.config';
import { addDoc, collection, getDocs, limit, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { collectionData } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #auth = inject(AUTH);
  private firestore = inject(FIRESTORE);

  private user$ = authState(this.#auth);

  // selectors
  user = toSignal(this.user$, { initialValue: null });


  constructor() {}

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
            errorMessage = 'Network error. Please check your internet connection';
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


  signUp(body: {email: string, password: string, firstName: string, lastName: string}) {
    return from(
      createUserWithEmailAndPassword(
        this.#auth,
        body.email,
        body.password
      )
    ).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return from(
          setDoc(userDocRef, {
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName
          })
        );
      }),
      catchError((error) => {
        let errorMessage = 'An error occurred during sign up.';
        
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please try logging in or use a different email.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is invalid. Please enter a valid email.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled. Please contact support.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak. Please use a stronger password.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            console.error('Signup error:', error);
        }

        alert(errorMessage);
        return EMPTY;
      })
    );
  }
}
