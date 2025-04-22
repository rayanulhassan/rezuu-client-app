import { inject, Injectable } from '@angular/core';
import { FIRESTORE } from '../../app.config';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, arrayUnion, onSnapshot } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { ProfileAnalytics } from '../interfaces/analytics.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  #firestore = inject(FIRESTORE);
  #authService = inject(AuthService);

  watchProfileAnalytics(userId: string): Observable<ProfileAnalytics | null> {
    return new Observable<ProfileAnalytics | null>(observer => {
      const analyticsDocRef = doc(this.#firestore, 'analytics', userId);
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(analyticsDocRef, 
        (doc) => {
          if (doc.exists()) {
            observer.next(doc.data() as ProfileAnalytics);
          } else {
            observer.next(null);
          }
        },
        (error) => {
          console.error('Error watching analytics:', error);
          observer.error(error);
        }
      );

      // Clean up listener when unsubscribed
      return () => unsubscribe();
    });
  }

  async trackProfileView(viewedUserId: string, visitorInfo?: { name: string; email: string }): Promise<void> {
    const analyticsDocRef = doc(this.#firestore, 'analytics', viewedUserId);
    
    try {
      const analyticsDoc = await getDoc(analyticsDocRef);
      
      if (!analyticsDoc.exists()) {
        // Create new analytics document if it doesn't exist
        await setDoc(analyticsDocRef, {
          userId: viewedUserId,
          totalViews: 1,
          lastViewedAt: serverTimestamp(),
          visitors: visitorInfo ? [{
            name: visitorInfo.name,
            email: visitorInfo.email,
            timestamp: new Date()
          }] : []
        });
      } else {
        // Update existing analytics document
        const updateData: any = {
          totalViews: increment(1),
          lastViewedAt: serverTimestamp()
        };

        // Add visitor info if provided
        if (visitorInfo) {
          updateData.visitors = arrayUnion({
            name: visitorInfo.name,
            email: visitorInfo.email,
            timestamp: new Date()
          });
        }

        await updateDoc(analyticsDocRef, updateData);
      }
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  }

  async trackVideoView(userId: string, videoUrl: string, videoTitle: string): Promise<void> {
    const analyticsDocRef = doc(this.#firestore, 'analytics', userId);
    
    try {
      const analyticsDoc = await getDoc(analyticsDocRef);
      
      // Encode the video URL to make it a valid Firebase field path
      const encodedVideoUrl = videoUrl.replace(/[\/\.]/g, '_');

      if (!analyticsDoc.exists()) {
        // Create new analytics document if it doesn't exist
        await setDoc(analyticsDocRef, {
          userId: userId,
          totalViews: 0,
          lastViewedAt: serverTimestamp(),
          visitors: [],
          videoViews: {
            [encodedVideoUrl]: {
              originalUrl: videoUrl,
              title: videoTitle,
              totalViews: 1
            }
          }
        });
      } else {
        // Update video view statistics
        await updateDoc(analyticsDocRef, {
          [`videoViews.${encodedVideoUrl}.totalViews`]: increment(1),
          [`videoViews.${encodedVideoUrl}.originalUrl`]: videoUrl,
          [`videoViews.${encodedVideoUrl}.title`]: videoTitle
        });
      }
    } catch (error) {
      console.error('Error tracking video view:', error);
    }
  }

  async trackResumeDownload(userId: string): Promise<void> {
    const analyticsDocRef = doc(this.#firestore, 'analytics', userId);
    
    try {
      const analyticsDoc = await getDoc(analyticsDocRef);

      if (!analyticsDoc.exists()) {
        // Create new analytics document if it doesn't exist
        await setDoc(analyticsDocRef, {
          userId: userId,
          totalViews: 0,
          lastViewedAt: serverTimestamp(),
          visitors: [],
          videoViews: {},
          resumeDownloads: 1
        });
      } else {
        // Update resume download counter
        await updateDoc(analyticsDocRef, {
          resumeDownloads: increment(1)
        });
      }
    } catch (error) {
      console.error('Error tracking resume download:', error);
    }
  }

  async trackCertificateDownload(userId: string, certificateUrl: string, certificateName: string): Promise<void> {
    const analyticsDocRef = doc(this.#firestore, 'analytics', userId);
    
    try {
      const analyticsDoc = await getDoc(analyticsDocRef);
      
      // Encode the certificate URL to make it a valid Firebase field path
      const encodedCertificateUrl = certificateUrl.replace(/[\/\.]/g, '_');

      if (!analyticsDoc.exists()) {
        // Create new analytics document if it doesn't exist
        await setDoc(analyticsDocRef, {
          userId: userId,
          totalViews: 0,
          lastViewedAt: serverTimestamp(),
          visitors: [],
          videoViews: {},
          resumeDownloads: 0,
          certificateDownloads: {
            [encodedCertificateUrl]: {
              originalUrl: certificateUrl,
              name: certificateName,
              totalDownloads: 1
            }
          }
        });
      } else {
        // Update certificate download statistics
        await updateDoc(analyticsDocRef, {
          [`certificateDownloads.${encodedCertificateUrl}.totalDownloads`]: increment(1),
          [`certificateDownloads.${encodedCertificateUrl}.originalUrl`]: certificateUrl,
          [`certificateDownloads.${encodedCertificateUrl}.name`]: certificateName
        });
      }
    } catch (error) {
      console.error('Error tracking certificate download:', error);
    }
  }

  async getProfileAnalytics(userId: string): Promise<ProfileAnalytics | null> {
    try {
      const analyticsDocRef = doc(this.#firestore, 'analytics', userId);
      const analyticsDoc = await getDoc(analyticsDocRef);
      
      if (!analyticsDoc.exists()) {
        return null;
      }
      
      return analyticsDoc.data() as ProfileAnalytics;
    } catch (error) {
      console.error('Error fetching profile analytics:', error);
      return null;
    }
  }
}
