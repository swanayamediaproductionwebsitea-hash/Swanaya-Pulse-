CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text,
	"text" text NOT NULL,
	"timestamp" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_todo_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"text" text NOT NULL,
	"platform" text NOT NULL,
	"priority" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"month" text NOT NULL,
	"day" integer NOT NULL,
	"year" integer NOT NULL,
	"assigned_date" text,
	"video_url" text,
	"video_name" text,
	"video_size" text,
	"status" text NOT NULL,
	"platform" text NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"template_type" text NOT NULL,
	"last_modified" text NOT NULL,
	"modified_by" text NOT NULL,
	"google_doc_id" text,
	"google_doc_url" text,
	"has_watermark" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"bio" text,
	"designation" text,
	"profile_image" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
