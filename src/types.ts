export interface ContentDocument {
  id: string;
  title: string;
  content: string;
  templateType: 'Proposal' | 'Script' | 'Agreement' | 'Brief' | 'General';
  lastModified: string;
  modifiedBy: string;
  googleDocId?: string;
  googleDocUrl?: string;
  hasWatermark: boolean;
}

export interface ContentPlan {
  id: string;
  title: string;
  type: 'Video' | 'Image' | 'Article' | 'Campaign' | 'Story' | string;
  description: string;
  month: string; // "January" ... "December"
  day: number;   // 1 to 31
  year: number;
  assignedDate?: string; // YYYY-MM-DD custom assigned date
  videoUrl?: string; // object URL or link for previewing uploaded videos/photos
  videoName?: string;
  videoSize?: string;
  mediaType?: 'video' | 'image' | 'link' | string;
  storyViewRate?: string; // e.g. "14.8%" View Rate
  storyViews?: number; // e.g. 1850 total story views
  views?: number; // Views / Impressions / Video Plays
  likes?: number; // Likes count
  comments?: number; // Comments count
  shares?: number; // Shares / Retweets / Link Clicks
  engagementRate?: string; // e.g. "8.4%"
  viewRate?: string; // e.g. "18.2%"
  likeRate?: string; // e.g. "6.5%"
  externalLink?: string; // Direct YouTube/Instagram/Facebook Link
  status: 'Planned' | 'In Progress' | 'Completed' | 'Review' | 'Live';
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Facebook' | string;
  createdAt: string;
  createdBy?: string; // Track who created the plan
  assignee?: string; // Operator/Event Planner assigned
  accountHandle?: string; // Pre-registered account handle (e.g. @chai_with_aadi, @youtube_chai_podcasts)
  accountName?: string; // Pre-registered account name
  tags?: string; // Comma separated video tags
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string; // HH:MM:SS
  type: 'info' | 'success' | 'warning' | 'action' | 'upload' | 'error';
}

export interface RegisteredUser {
  username: string;
  password?: string;
  email?: string;
  provider?: string;
  uid?: string;
  fullName?: string;
  bio?: string;
  designation?: string;
  profileImage?: string;
  permissionLevel?: 'viewer' | 'editor' | 'administrator';
  isDemo?: boolean;
  demoExpiresAt?: string;
}

export interface AiTodoItem {
  id: string;
  text: string;
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Facebook' | 'Google Ads' | 'Meta Ads';
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  createdAt: string;
  assignee?: string;
  visibility?: 'public' | 'private';
}



