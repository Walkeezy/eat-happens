ALTER TABLE "rating"
ADD COLUMN "food_score" smallint;

--> statement-breakpoint
ALTER TABLE "rating"
ADD COLUMN "ambience_score" smallint;

--> statement-breakpoint
ALTER TABLE "rating"
ADD COLUMN "price_performance_score" smallint;
