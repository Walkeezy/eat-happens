-- Rename score column to legacy_score and make it nullable
ALTER TABLE "rating"
RENAME COLUMN "score" TO "legacy_score";

--> statement-breakpoint
ALTER TABLE "rating"
ALTER COLUMN "legacy_score"
DROP NOT NULL;
