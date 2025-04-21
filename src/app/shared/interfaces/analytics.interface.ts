export interface ProfileAnalytics {
  userId: string;
  totalViews: number;
  lastViewedAt: Date;
  visitors: {
    name: string;
    email: string;
    timestamp: Date;
  }[];
}
