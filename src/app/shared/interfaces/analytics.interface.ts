export interface ProfileAnalytics {
  userId: string;
  totalViews: number;
  lastViewedAt: Date;
  visitors: Array<{
    name: string;
    email: string;
    timestamp: Date;
  }>;
  videoViews: {
    [encodedVideoUrl: string]: {
      originalUrl: string;  // The original video URL
      title: string;       // The video title/description
      totalViews: number;
    };
  };
}
