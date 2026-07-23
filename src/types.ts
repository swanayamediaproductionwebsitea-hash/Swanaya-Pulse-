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
  type: 'Video' | 'Image' | 'Article' | 'Campaign' | 'Story';
  description: string;
  month: string; // "January" ... "December"
  day: number;   // 1 to 31
  year: number;
  assignedDate?: string; // YYYY-MM-DD custom assigned date
  videoUrl?: string; // object URL for previewing uploaded videos
  videoName?: string;
  videoSize?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Review' | 'Live';
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Facebook';
  createdAt: string;
  createdBy?: string; // Track who created the plan
  assignee?: string; // Operator/Event Planner assigned
  tags?: string; // Comma separated video tags
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string; // HH:MM:SS
  type: 'info' | 'success' | 'warning' | 'action' | 'upload';
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



