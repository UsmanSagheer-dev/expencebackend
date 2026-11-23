CREATE TABLE IF NOT EXISTS "mess_members" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL DEFAULT '',
  "joined_at" TIMESTAMP(3) NOT NULL,
  "left_at" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "mess_contributions" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "member_id" TEXT NOT NULL REFERENCES "mess_members"("id") ON DELETE CASCADE,
  "amount" DECIMAL(12,2) NOT NULL,
  "date" DATE NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "mess_expenses" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "purchased_by_id" TEXT REFERENCES "mess_members"("id") ON DELETE SET NULL,
  "date" DATE NOT NULL,
  "item" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "quantity" DECIMAL(10,3) NOT NULL,
  "unit" TEXT NOT NULL,
  "unit_price" DECIMAL(12,2),
  "amount" DECIMAL(12,2) NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "flour_purchases" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "member_id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "quantity_kg" DECIMAL(10,3) NOT NULL,
  "rate_per_kg" DECIMAL(12,2) NOT NULL,
  "total_amount" DECIMAL(12,2) NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'open',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ended_at" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "flour_consumptions" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "quantity_kg" DECIMAL(10,3) NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "roti_records" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "meal_time" TEXT NOT NULL,
  "batch_id" TEXT NOT NULL,
  "flour_kg" DECIMAL(10,3) NOT NULL,
  "roti_count" INTEGER NOT NULL,
  "rate_per_roti" DECIMAL(12,2) NOT NULL,
  "cooking_fee" DECIMAL(12,2) NOT NULL,
  "cook_name" TEXT NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "cook_payments" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expense_id" TEXT,
  "date" DATE NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "payment_type" TEXT NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "tea_records" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "milk_quantity" DECIMAL(10,3) NOT NULL,
  "milk_unit" TEXT NOT NULL,
  "milk_cost" DECIMAL(12,2) NOT NULL,
  "tea_quantity" DECIMAL(10,3) NOT NULL,
  "tea_unit" TEXT NOT NULL,
  "tea_cost" DECIMAL(12,2) NOT NULL,
  "sugar_quantity" DECIMAL(10,3) NOT NULL,
  "sugar_unit" TEXT NOT NULL,
  "sugar_cost" DECIMAL(12,2) NOT NULL,
  "cups" INTEGER NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "mess_audit_entries" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "details" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "mess_members_user_id_idx" ON "mess_members"("user_id");
CREATE INDEX IF NOT EXISTS "mess_contributions_user_id_idx" ON "mess_contributions"("user_id");
CREATE INDEX IF NOT EXISTS "mess_contributions_member_id_idx" ON "mess_contributions"("member_id");
CREATE INDEX IF NOT EXISTS "mess_expenses_user_id_idx" ON "mess_expenses"("user_id");
CREATE INDEX IF NOT EXISTS "mess_expenses_purchased_by_id_idx" ON "mess_expenses"("purchased_by_id");
CREATE INDEX IF NOT EXISTS "flour_purchases_user_id_idx" ON "flour_purchases"("user_id");
CREATE INDEX IF NOT EXISTS "flour_consumptions_user_id_idx" ON "flour_consumptions"("user_id");
CREATE INDEX IF NOT EXISTS "roti_records_user_id_idx" ON "roti_records"("user_id");
CREATE INDEX IF NOT EXISTS "cook_payments_user_id_idx" ON "cook_payments"("user_id");
CREATE INDEX IF NOT EXISTS "tea_records_user_id_idx" ON "tea_records"("user_id");
CREATE INDEX IF NOT EXISTS "mess_audit_entries_user_id_idx" ON "mess_audit_entries"("user_id");
