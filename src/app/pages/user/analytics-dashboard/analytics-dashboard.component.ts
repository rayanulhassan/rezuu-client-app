import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ProfileAnalytics } from '../../../shared/interfaces/analytics.interface';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';

interface VideoAnalytics {
  name: string;
  clicks: number;
}

interface ProfileViewer {
  firstName: string;
  lastName: string;
  email: string;
  viewedAt: Date;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CardModule
  ],
  templateUrl: './analytics-dashboard.component.html',
  styles: ``
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);
  private analyticsSubscription?: Subscription;

  analytics: ProfileAnalytics | null = null;
  isLoading = true;
  error: string | null = null;

  // Computed properties for the dashboard
  totalProfileViews = 0;
  resumeDownloads = 0;
  certificateDownloads = 0;
  mostPopularVideo = 'Introduction';

  // Tables data
  videoAnalytics: VideoAnalytics[] = [];
  profileViewers: ProfileViewer[] = [];

  ngOnInit() {
    const currentUser = this.authService.authUser();
    if (!currentUser) {
      this.error = 'No authenticated user found';
      this.isLoading = false;
      return;
    }

    // Subscribe to real-time analytics updates
    this.analyticsSubscription = this.analyticsService.watchProfileAnalytics(currentUser.uid)
      .subscribe({
        next: (analytics) => {
          this.analytics = analytics;
          if (analytics) {
            this.processAnalytics();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching analytics:', error);
          this.error = 'Error fetching analytics data';
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.analyticsSubscription) {
      this.analyticsSubscription.unsubscribe();
    }
  }

  private processAnalytics() {
    if (!this.analytics) return;

    // Set total profile views
    this.totalProfileViews = this.analytics.totalViews;

    // Process video analytics
    this.videoAnalytics = Object.entries(this.analytics.videoViews || {}).map(([_, data]) => ({
      name: data.title,
      clicks: data.totalViews
    }));

    // Find most popular video
    const mostPopular = this.videoAnalytics.reduce((prev, current) => 
      (prev.clicks > current.clicks) ? prev : current
    , { name: '', clicks: 0 });
    this.mostPopularVideo = mostPopular.name || 'No videos viewed';

    // Set resume downloads
    this.resumeDownloads = this.analytics.resumeDownloads || 0;

    // Calculate total certificate downloads
    this.certificateDownloads = Object.values(this.analytics.certificateDownloads || {})
      .reduce((sum, cert) => sum + cert.totalDownloads, 0);

    // Process profile viewers (unique visitors with latest timestamp)
    const visitorMap = new Map<string, ProfileViewer>();
    
    (this.analytics.visitors || []).forEach(visitor => {
      const visitorKey = visitor.email; // Using email as unique identifier
      const existingVisitor = visitorMap.get(visitorKey);
      
      // Convert Firestore Timestamp to JavaScript Date
      const viewedAt = visitor.timestamp instanceof Timestamp 
        ? visitor.timestamp.toDate() 
        : new Date(visitor.timestamp);

      const newVisitor: ProfileViewer = {
        firstName: visitor.name.split(' ')[0] || '',
        lastName: visitor.name.split(' ')[1] || '',
        email: visitor.email,
        viewedAt
      };

      // Only update if this is a new visitor or if this visit is more recent
      if (!existingVisitor || newVisitor.viewedAt > existingVisitor.viewedAt) {
        visitorMap.set(visitorKey, newVisitor);
      }
    });

    // Convert map to array and sort by most recent first
    this.profileViewers = Array.from(visitorMap.values())
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime());
  }
}
