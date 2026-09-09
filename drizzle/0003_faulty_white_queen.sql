ALTER TABLE "event_assignment" DROP CONSTRAINT "event_assignment_assigned_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "date" SET DATA TYPE date USING "date"::date;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_cost" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_total_cost_positive" CHECK ("event"."total_cost" IS NULL OR "event"."total_cost" > 0);--> statement-breakpoint
ALTER TABLE "event_assignment" ADD CONSTRAINT "event_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_legacy_score_range" CHECK ("rating"."legacy_score" IS NULL OR ("rating"."legacy_score" BETWEEN 1 AND 5));--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_food_score_range" CHECK ("rating"."food_score" IS NULL OR ("rating"."food_score" BETWEEN 1 AND 5));--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_ambience_score_range" CHECK ("rating"."ambience_score" IS NULL OR ("rating"."ambience_score" BETWEEN 1 AND 5));--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_price_performance_score_range" CHECK ("rating"."price_performance_score" IS NULL OR ("rating"."price_performance_score" BETWEEN 1 AND 5));