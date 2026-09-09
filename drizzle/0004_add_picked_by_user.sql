ALTER TABLE "event" ADD COLUMN "picked_by_user_id" text;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_picked_by_user_id_user_id_fk" FOREIGN KEY ("picked_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_picked_by_user_id_idx" ON "event" USING btree ("picked_by_user_id");
