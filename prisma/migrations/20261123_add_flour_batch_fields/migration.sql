ALTER TABLE "flour_purchases"
  ADD COLUMN IF NOT EXISTS "purchased_kg" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "carryover_kg" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "carryover_transferred" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "ending_flour_used_kg" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "ending_roti_count" INTEGER,
  ADD COLUMN IF NOT EXISTS "flour_per_roti_grams" DECIMAL(10,3);
