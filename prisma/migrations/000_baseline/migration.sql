-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'RESTAURANT_ADMIN');

-- CreateEnum
CREATE TYPE "DiningType" AS ENUM ('DINE_IN', 'PICKUP');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'PREPARING', 'READY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'VERIFIED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(15),
    "password_hash" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_food_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "ingredient_name" VARCHAR(100),
    "is_allergy" BOOLEAN NOT NULL DEFAULT false,
    "is_dislike" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_food_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" VARCHAR(100),
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "phone" VARCHAR(15),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "cuisine" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_url" TEXT,
    "upi_id" VARCHAR(100),

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_qr_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "restaurant_id" UUID NOT NULL,
    "qr_code_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "restaurant_id" UUID NOT NULL,
    "time" VARCHAR(20) NOT NULL,
    "total_seats" INTEGER NOT NULL DEFAULT 20,
    "booked_seats" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "table_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "restaurant_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "cooking_method" TEXT,
    "calories" INTEGER,
    "price" DECIMAL(10,2),
    "recommended_for" TEXT,
    "image_url" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "category" VARCHAR(100),

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_ingredients" (
    "dish_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "is_allergen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "dish_ingredients_pkey" PRIMARY KEY ("dish_id","ingredient_id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "restaurant_id" UUID NOT NULL,
    "title" VARCHAR(150),
    "discount_percent" INTEGER,
    "valid_from" DATE,
    "valid_to" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "restaurant_id" UUID,
    "dining_option" "DiningType",
    "scheduled_time" TIMESTAMP(3),
    "status" "OrderStatus" DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "order_id" UUID NOT NULL,
    "dish_id" UUID NOT NULL,
    "quantity" INTEGER DEFAULT 1,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_id","dish_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "dish_id" UUID,
    "rating" INTEGER,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar" TEXT,
    "restaurant_id" UUID,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "critic_score" DOUBLE PRECISION,
    "food" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" VARCHAR(255),
    "price_range" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "transaction_id" VARCHAR(100),
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "method" "PaymentMethod" NOT NULL DEFAULT 'UPI',
    "upi_id_used" VARCHAR(100),
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_email_key" ON "restaurants"("email");

-- CreateIndex
CREATE INDEX "idx_restaurant_location" ON "restaurants"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "restaurants_email_idx" ON "restaurants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_qr_codes_restaurant_id_key" ON "restaurant_qr_codes"("restaurant_id");

-- CreateIndex
CREATE INDEX "idx_table_slots_restaurant" ON "table_slots"("restaurant_id");

-- CreateIndex
CREATE INDEX "idx_dishes_restaurant" ON "dishes"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- CreateIndex
CREATE INDEX "vendors_name_idx" ON "vendors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- AddForeignKey
ALTER TABLE "user_food_preferences" ADD CONSTRAINT "user_food_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_qr_codes" ADD CONSTRAINT "restaurant_qr_codes_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_slots" ADD CONSTRAINT "table_slots_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

