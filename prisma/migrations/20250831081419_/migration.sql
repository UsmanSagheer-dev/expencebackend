-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expenses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT,
    "item_name" TEXT NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "expense_date" DATE NOT NULL,
    "description" TEXT,
    "bill_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budgets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_budget" DECIMAL(12,2) NOT NULL,
    "budget_period" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_expense_to_persons" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "person_name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_expense_to_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lending_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "person_name" TEXT NOT NULL,
    "amount_taken" DECIMAL(12,2) NOT NULL,
    "amount_returned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lending_date" DATE NOT NULL,
    "description" TEXT,
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lending_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_money_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "amount_received" DECIMAL(12,2) NOT NULL,
    "amount_returned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "transaction_date" DATE NOT NULL,
    "description" TEXT,
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_money_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "dashboard_view" TEXT NOT NULL DEFAULT 'today',
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_expenses_user_id" ON "public"."expenses"("user_id");

-- CreateIndex
CREATE INDEX "idx_expenses_date" ON "public"."expenses"("expense_date");

-- CreateIndex
CREATE INDEX "idx_expenses_category" ON "public"."expenses"("category_id");

-- CreateIndex
CREATE INDEX "idx_budget_user_id" ON "public"."budgets"("user_id");

-- CreateIndex
CREATE INDEX "idx_budget_active" ON "public"."budgets"("is_active");

-- CreateIndex
CREATE INDEX "idx_lending_user_id" ON "public"."lending_records"("user_id");

-- CreateIndex
CREATE INDEX "idx_lending_person" ON "public"."lending_records"("person_name");

-- CreateIndex
CREATE INDEX "idx_lending_settled" ON "public"."lending_records"("is_settled");

-- CreateIndex
CREATE INDEX "idx_company_money_user_id" ON "public"."company_money_records"("user_id");

-- CreateIndex
CREATE INDEX "idx_company_money_company" ON "public"."company_money_records"("company_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "public"."user_settings"("user_id");

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_expense_to_persons" ADD CONSTRAINT "budget_expense_to_persons_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lending_records" ADD CONSTRAINT "lending_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_money_records" ADD CONSTRAINT "company_money_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
