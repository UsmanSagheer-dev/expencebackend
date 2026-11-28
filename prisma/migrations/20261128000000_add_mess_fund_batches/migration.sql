CREATE TABLE "mess_fund_batches" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "opened_at" DATE NOT NULL,
  "closed_at" DATE,
  "opening_balance" DECIMAL(12,2) NOT NULL,
  "closing_balance" DECIMAL(12,2),
  "carryover_from_batch_id" TEXT,
  "closing_note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "mess_fund_batches_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "mess_fund_batches_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "mess_contributions" ADD COLUMN "batch_id" TEXT;
ALTER TABLE "mess_expenses" ADD COLUMN "batch_id" TEXT;
ALTER TABLE "cook_payments" ADD COLUMN "batch_id" TEXT;

CREATE INDEX "mess_fund_batches_user_id_idx" ON "mess_fund_batches"("user_id");
CREATE INDEX "mess_fund_batches_carryover_from_batch_id_idx" ON "mess_fund_batches"("carryover_from_batch_id");
CREATE INDEX "mess_contributions_batch_id_idx" ON "mess_contributions"("batch_id");
CREATE INDEX "mess_expenses_batch_id_idx" ON "mess_expenses"("batch_id");
CREATE INDEX "cook_payments_batch_id_idx" ON "cook_payments"("batch_id");

ALTER TABLE "mess_contributions"
  ADD CONSTRAINT "mess_contributions_batch_id_fkey"
  FOREIGN KEY ("batch_id") REFERENCES "mess_fund_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "mess_expenses"
  ADD CONSTRAINT "mess_expenses_batch_id_fkey"
  FOREIGN KEY ("batch_id") REFERENCES "mess_fund_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cook_payments"
  ADD CONSTRAINT "cook_payments_batch_id_fkey"
  FOREIGN KEY ("batch_id") REFERENCES "mess_fund_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
