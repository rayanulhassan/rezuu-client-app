import { inject, Injectable } from '@angular/core';
import { FIRESTORE } from '../../app.config';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { ProfileAnalytics } from '../interfaces/analytics.interface';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  #firestore = inject(FIRESTORE);
  #authService = inject(AuthService);

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
