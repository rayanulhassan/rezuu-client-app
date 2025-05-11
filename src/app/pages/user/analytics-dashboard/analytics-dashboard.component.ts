import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';
import { ProfileAnalytics } from '../../../shared/interfaces/analytics.interface';
import { Subscription } from 'rxjs';
import { ChartModule } from 'primeng/chart';

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
  imports: [CommonModule, TableModule, CardModule, ChartModule],
  templateUrl: './analytics-dashboard.component.html',
  styles: [
    `
      .upgrade-message {
        background-color: #fef2f2;
        border: 1px solid #fee2e2;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1rem;
        color: #991b1b;
      }
      .upgrade-message i {
        margin-right: 0.5rem;
      }
    `,
  ],
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private analyticsSubscription?: Subscription;

  analytics: ProfileAnalytics | null = null;
  isLoading = true;
  error: string | null = null;
  hasWhoViewedProfileAccess = false;

  // Computed properties for the dashboard
  totalProfileViews = 0;
  resumeDownloads = 0;
  certificateDownloads = 0;
  mostPopularVideo = 'Introduction';

  // Tables data
  videoAnalytics: VideoAnalytics[] = [];
  profileViewers: ProfileViewer[] = [];

  data: any;
  options: any;

  ngOnInit() {
    const currentUser = this.authService.authUser();
    if (!currentUser) {
      this.error = 'No authenticated user found';
      this.isLoading = false;
      return;
    }

    // Check if user has access to who viewed profile feature
    const userDetails = this.userService.userDetails();
    this.hasWhoViewedProfileAccess = !!(
      userDetails?.isPayingUser && userDetails?.planOptions?.whoViewedProfile
    );

    // Subscribe to real-time analytics updates
    this.analyticsSubscription = this.analyticsService
      .watchProfileAnalytics(currentUser.uid)
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
        },
      });
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.analyticsSubscription) {
      this.analyticsSubscription.unsubscribe();
    }
  }

  navigateToPricing() {
    this.router.navigate(['/pricing']);
  }

  private processMonthlyViews() {
    if (!this.analytics?.visitors) {
      return;
    }

    // Create a map to store views per month
    const monthlyViews = new Map<string, number>();

    // Get the last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();

    // Initialize all months with 0 views
    months.forEach((month) => monthlyViews.set(month, 0));

    // Count views per month
    this.analytics.visitors.forEach((visitor) => {
      let date: Date;
      if (
        !(visitor.timestamp instanceof Date) &&
        visitor.timestamp &&
        typeof (visitor.timestamp as any).toDate === 'function'
      ) {
        // Firestore Timestamp
        date = (visitor.timestamp as any).toDate();
      } else if (
        typeof visitor.timestamp === 'string' ||
        typeof visitor.timestamp === 'number'
      ) {
        // String or number
        date = new Date(visitor.timestamp);
      } else if (visitor.timestamp instanceof Date) {
        // Already a Date
        date = visitor.timestamp;
      } else {
        // Fallback
        date = new Date(NaN);
      }
      const month = date.toLocaleString('default', { month: 'short' });

      monthlyViews.set(month, (monthlyViews.get(month) || 0) + 1);
    });

    // Update chart data
    this.data = {
      labels: months,
      datasets: [
        {
          label: 'Profile Views',
          data: months.map((month) => monthlyViews.get(month) || 0),
          fill: false,
          borderColor: '#4e949d',
          tension: 0.4,
          backgroundColor: '#4e949d',
        },
      ],
    };

    this.options = {
      maintainAspectRatio: true,
      aspectRatio: 1.5,

      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#1f2937',
          bodyColor: '#4b5563',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function (context: any) {
              return `Views: ${context.raw}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#6b7280',
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#e5e7eb',
          },
          ticks: {
            color: '#6b7280',
            precision: 0,
          },
        },
      },
    };
  }

  private processAnalytics() {
    if (!this.analytics) return;

    // Set total profile views
    this.totalProfileViews = this.analytics.totalViews;

    // Process video analytics
    this.videoAnalytics = Object.entries(this.analytics.videoViews || {}).map(
      ([_, data]) => ({
        name: data.title,
        clicks: data.totalViews,
      })
    );

    // Find most popular video
    const mostPopular = this.videoAnalytics.reduce(
      (prev, current) => (prev.clicks > current.clicks ? prev : current),
      { name: '', clicks: 0 }
    );
    this.mostPopularVideo = mostPopular.name || 'No videos viewed';

    // Set resume downloads
    this.resumeDownloads = this.analytics.resumeDownloads || 0;

    // Calculate total certificate downloads
    this.certificateDownloads = Object.values(
      this.analytics.certificateDownloads || {}
    ).reduce((sum, cert) => sum + cert.totalDownloads, 0);

    // Process monthly views for the chart
    this.processMonthlyViews();

    // Only process profile viewers if user has access
    if (this.hasWhoViewedProfileAccess) {
      // Process profile viewers (unique visitors with latest timestamp)
      const visitorMap = new Map<string, ProfileViewer>();

      (this.analytics.visitors || []).forEach((visitor) => {
        const visitorKey = visitor.email; // Using email as unique identifier
        const existingVisitor = visitorMap.get(visitorKey);

        // Robust date parsing
        let viewedAt: Date | null = null;
        if (
          !(visitor.timestamp instanceof Date) &&
          visitor.timestamp &&
          typeof (visitor.timestamp as any).toDate === 'function'
        ) {
          viewedAt = (visitor.timestamp as any).toDate();
        } else if (
          typeof visitor.timestamp === 'string' ||
          typeof visitor.timestamp === 'number'
        ) {
          viewedAt = new Date(visitor.timestamp);
        } else if (visitor.timestamp instanceof Date) {
          viewedAt = visitor.timestamp;
        }
        // Only use valid dates
        if (!viewedAt || isNaN(viewedAt.getTime())) {
          return;
        }

        const newVisitor: ProfileViewer = {
          firstName: visitor.name.split(' ')[0] || '',
          lastName: visitor.name.split(' ')[1] || '',
          email: visitor.email,
          viewedAt,
        };

        // Only update if this is a new visitor or if this visit is more recent
        if (
          !existingVisitor ||
          newVisitor.viewedAt > existingVisitor.viewedAt
        ) {
          visitorMap.set(visitorKey, newVisitor);
        }
      });

      // Convert map to array and sort by most recent first
      this.profileViewers = Array.from(visitorMap.values()).sort(
        (a, b) => b.viewedAt.getTime() - a.viewedAt.getTime()
      );
    }
  }
}
