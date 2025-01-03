-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."enum_untisAccesses_type" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "users" (
	"userId" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "untisAccesses" (
	"untisAccessId" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "enum_untisAccesses_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"urlId" varchar(255) NOT NULL,
	"school" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"timezone" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "untisAccesses_urlId_key" UNIQUE("urlId")
);
--> statement-breakpoint
CREATE TABLE "publicUntisAccesses" (
	"untisAccessId" integer PRIMARY KEY NOT NULL,
	"classId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "privateUntisAccesses" (
	"untisAccessId" integer PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "untisAccesses" ADD CONSTRAINT "untisAccesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "publicUntisAccesses" ADD CONSTRAINT "publicUntisAccesses_untisAccessId_fkey" FOREIGN KEY ("untisAccessId") REFERENCES "public"."untisAccesses"("untisAccessId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "privateUntisAccesses" ADD CONSTRAINT "privateUntisAccesses_untisAccessId_fkey" FOREIGN KEY ("untisAccessId") REFERENCES "public"."untisAccesses"("untisAccessId") ON DELETE cascade ON UPDATE cascade;
*/