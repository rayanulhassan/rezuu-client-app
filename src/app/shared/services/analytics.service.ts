import { inject, Injectable } from '@angular/core';
import { FIRESTORE } from '../../app.config';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { ProfileAnalytics } from '../interfaces/analytics.interface';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  #firestore = inject(FIRESTORE);
  #authService = inject(AuthService);

  async trackProfileView(viewedUserId: string): Promise<void> {
    const analyticsDocRef = doc(this.#firestore, 'analytics', viewedUserId);
    
    try {
      const analyticsDoc = await getDoc(analyticsDocRef);
      
      if (!analyticsDoc.exists()) {
        // Create new analytics document if it doesn't exist
        await setDoc(analyticsDocRef, {
          userId: viewedUserId,
          totalViews: 1,
          lastViewedAt: serverTimestamp()
        });
      } else {
        // Update existing analytics document
        await updateDoc(analyticsDocRef, {
          totalViews: increment(1),
          lastViewedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error tracking profile view:', error);
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
