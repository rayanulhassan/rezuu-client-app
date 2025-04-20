import { inject, Injectable, DestroyRef } from '@angular/core';
import { Observable, switchMap, of } from 'rxjs';
import { RezuuUser } from '../interfaces/auth.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FIRESTORE } from '../../app.config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  #firestore = inject(FIRESTORE);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  #messageService = inject(MessageService);

  userDetails = toSignal(
    toObservable(this.#authService.authUser).pipe(
      switchMap((user) => {
        if (!user) return of(null);
        return this.getUser(user.uid);
      })
    ),
    { initialValue: null }
  );

  private getUser(uid: string): Observable<RezuuUser | null> {
    return new Observable<RezuuUser | null>(observer => {
      const userDocRef = doc(this.#firestore, 'users', uid);
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        userDocRef,
        (doc) => {
          observer.next(doc.data() as RezuuUser);
        },
        (error) => {
          this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching user data' });
          console.error('Error fetching user data:', error);
          observer.error(error);
        }
      );

      // Clean up the listener when the observable is unsubscribed
      this.#destroyRef.onDestroy(() => unsubscribe());

      return () => unsubscribe();
    });
  }

  getFullAssetUrl(assetKey: string | null | undefined): string | undefined {
    if (!assetKey) return undefined;
    return `${environment.bucketUrl}${assetKey}`;
  }

  async updateProfileImage(imageUrl: string): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    // Extract just the asset key from the full URL
    const assetKey = imageUrl.replace(environment.bucketUrl, '');
    
    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    
    try {
      await updateDoc(userDocRef, {
        profileImage: assetKey
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile image updated successfully' });
    } catch (error) {
      console.error('Error updating profile image:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error updating profile image' });
      throw error;
    }
  }

  async updateDescription(description: string): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    
    try {
      await updateDoc(userDocRef, {
        description: description
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Description updated successfully' });
    } catch (error) {
      console.error('Error updating description:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error updating description' });
      throw error;
    }
  }

  async updateResume(resumeUrl: string): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    // Extract just the asset key from the full URL
    const assetKey = resumeUrl.replace(environment.bucketUrl, '');
    
    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    
    try {
      await updateDoc(userDocRef, {
        resume: assetKey
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Resume updated successfully' });
    } catch (error) {
      console.error('Error updating resume:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error updating resume' });
      throw error;
    }
  }
}
