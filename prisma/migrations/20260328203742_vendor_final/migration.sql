-- CreateTable
CREATE TABLE "vendor_admin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_admin_email_key" ON "vendor_admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_admin_mobile_key" ON "vendor_admin"("mobile");
