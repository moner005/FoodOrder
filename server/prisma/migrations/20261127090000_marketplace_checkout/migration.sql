-- Extend restaurants with operational marketplace settings. Existing rows remain open and unrestricted.
ALTER TABLE "Restaurant"
  ADD COLUMN "cuisine" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "isOpen" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "minimumSubtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "deliveryAreas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Persist a durable idempotency record for each customer checkout request.
CREATE TABLE "CheckoutBatch" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "payloadFingerprint" TEXT NOT NULL,
  "deliveryArea" TEXT,
  "subtotal" DECIMAL(10,2) NOT NULL,
  "deliveryFee" DECIMAL(10,2) NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CheckoutBatch_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Order"
  ADD COLUMN "restaurantName" TEXT,
  ADD COLUMN "deliveryArea" TEXT,
  ADD COLUMN "checkoutBatchId" TEXT;

CREATE UNIQUE INDEX "CheckoutBatch_userId_requestId_key" ON "CheckoutBatch"("userId", "requestId");
CREATE INDEX "CheckoutBatch_userId_createdAt_idx" ON "CheckoutBatch"("userId", "createdAt");
CREATE INDEX "Order_checkoutBatchId_idx" ON "Order"("checkoutBatchId");

ALTER TABLE "CheckoutBatch" ADD CONSTRAINT "CheckoutBatch_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_checkoutBatchId_fkey"
  FOREIGN KEY ("checkoutBatchId") REFERENCES "CheckoutBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;