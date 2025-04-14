import { inject, Injectable } from '@angular/core';
import { from, defer } from 'rxjs';
import { Credentials } from '../interfaces/auth.interface';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { authState } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { AUTH } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #auth = inject(AUTH);

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
    );
  }

  logout() {
    signOut(this.#auth);
  }

  signUp(credentials: Credentials) {
    return from(
      createUserWithEmailAndPassword(
          this.#auth,
          credentials.email,
        credentials.password
      )
    );
  }
}
