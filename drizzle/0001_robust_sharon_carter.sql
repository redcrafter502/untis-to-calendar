CREATE TABLE "secretUntisAccesses" (
	"untisAccessId" integer PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"secret" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "privateUntisAccesses" RENAME TO "passwordUntisAccesses";--> statement-breakpoint
ALTER TABLE "passwordUntisAccesses" DROP CONSTRAINT "privateUntisAccesses_untisAccessId_fkey";
--> statement-breakpoint
ALTER TABLE "secretUntisAccesses" ADD CONSTRAINT "secretUntisAccesses_untisAccessId_fkey" FOREIGN KEY ("untisAccessId") REFERENCES "public"."untisAccesses"("untisAccessId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "passwordUntisAccesses" ADD CONSTRAINT "passwordUntisAccesses_untisAccessId_fkey" FOREIGN KEY ("untisAccessId") REFERENCES "public"."untisAccesses"("untisAccessId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "public"."untisAccesses" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."enum_untisAccesses_type";--> statement-breakpoint
CREATE TYPE "public"."enum_untisAccesses_type" AS ENUM('public', 'password', 'secret');--> statement-breakpoint
ALTER TABLE "public"."untisAccesses" ALTER COLUMN "type" SET DATA TYPE "public"."enum_untisAccesses_type" USING "type"::"public"."enum_untisAccesses_type";