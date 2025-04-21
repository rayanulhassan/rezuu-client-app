import { inject, Injectable, DestroyRef } from '@angular/core';
import { Observable, switchMap, of } from 'rxjs';
import { RezuuUser } from '../interfaces/auth.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FIRESTORE } from '../../app.config';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
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

  async updateCertificates(certificateUrls: string[]): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    // Extract just the asset keys from the full URLs and get file names
    const certificates = certificateUrls.map(url => {
      const assetKey = url.replace(environment.bucketUrl, '');
      // Extract file name from the URL (everything after the last slash)
      const fileName = assetKey.split('/').pop() || 'Unknown';
      return {
        url: assetKey,
        name: fileName
      };
    });
    
    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    
    try {
      await updateDoc(userDocRef, {
        certificates: certificates
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Certificates updated successfully' });
    } catch (error) {
      console.error('Error updating certificates:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error updating certificates' });
      throw error;
    }
  }

  async removeCertificate(certificateUrl: string): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    const currentCertificates = currentUser.certificates || [];
    
    try {
      // Filter out the certificate to be removed
      const updatedCertificates = currentCertificates.filter(cert => cert.url !== certificateUrl);
      
      await updateDoc(userDocRef, {
        certificates: updatedCertificates
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Certificate removed successfully' });
    } catch (error) {
      console.error('Error removing certificate:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error removing certificate' });
      throw error;
    }
  }

  async updateUserInfo(data: { firstName: string; lastName: string; contactNumber: string | null; email: string }): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    
    try {
      await updateDoc(userDocRef, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contactNumber
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile information updated successfully' });
    } catch (error) {
      console.error('Error updating profile information:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error updating profile information' });
      throw error;
    }
  }

  async updatePublicProfileStatus(isPublic: boolean): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    
    try {
      await updateDoc(userDocRef, {
        isPublicProfile: isPublic
      });
      this.#messageService.add({ 
        severity: 'success', 
        summary: 'Success', 
        detail: `Profile is now ${isPublic ? 'public' : 'private'}` 
      });
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error updating profile visibility' });
      throw error;
    }
  }

  async addExternalLink(link: { platform: string; url: string }): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    const currentLinks = currentUser.externalLinks || [];
    
    try {
      await updateDoc(userDocRef, {
        externalLinks: [...currentLinks, link]
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'External link added successfully' });
    } catch (error) {
      console.error('Error adding external link:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error adding external link' });
      throw error;
    }
  }

  async removeExternalLink(link: { platform: string; url: string }): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    const currentLinks = (currentUser.externalLinks || []) as { platform: string; url: string }[];
    
    try {
      const updatedLinks = currentLinks.filter(
        l => l.platform !== link.platform || l.url !== link.url
      );
      
      await updateDoc(userDocRef, {
        externalLinks: updatedLinks
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'External link removed successfully' });
    } catch (error) {
      console.error('Error removing external link:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error removing external link' });
      throw error;
    }
  }

  async updateVideos(videos: { url: string; description: string | null }[]): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    
    try {
      await updateDoc(userDocRef, {
        videos: videos
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Videos updated successfully' });
    } catch (error) {
      console.error('Error updating videos:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error updating videos' });
      throw error;
    }
  }

  async removeVideo(videoUrl: string): Promise<void> {
    const currentUser = this.userDetails();
    if (!currentUser) {
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No authenticated user found' });
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(this.#firestore, 'users', currentUser.uid);
    const currentVideos = currentUser.videos || [];
    
    try {
      const updatedVideos = currentVideos.filter(v => v.url !== videoUrl);
      
      await updateDoc(userDocRef, {
        videos: updatedVideos
      });
      this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Video removed successfully' });
    } catch (error) {
      console.error('Error removing video:', error);
      this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Error removing video' });
      throw error;
    }
  }

  async getUserByUid(uid: string): Promise<RezuuUser | null> {
    try {
      const userDocRef = doc(this.#firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return userDoc.data() as RezuuUser;
    } catch (error) {
      console.error('Error fetching user by UID:', error);
      throw error;
    }
  }
}
