import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name'),
  bio: text('bio'),
  designation: text('designation'),
  profileImage: text('profile_image'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contentPlans = pgTable('content_plans', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  month: text('month').notNull(),
  day: integer('day').notNull(),
  year: integer('year').notNull(),
  assignedDate: text('assigned_date'),
  videoUrl: text('video_url'),
  videoName: text('video_name'),
  videoSize: text('video_size'),
  status: text('status').notNull(),
  platform: text('platform').notNull(),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  templateType: text('template_type').notNull(),
  lastModified: text('last_modified').notNull(),
  modifiedBy: text('modified_by').notNull(),
  googleDocId: text('google_doc_id'),
  googleDocUrl: text('google_doc_url'),
  hasWatermark: boolean('has_watermark').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  uid: text('uid'),
  text: text('text').notNull(),
  timestamp: text('timestamp').notNull(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiTodoItems = pgTable('ai_todo_items', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull(),
  text: text('text').notNull(),
  platform: text('platform').notNull(),
  priority: text('priority').notNull(),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
