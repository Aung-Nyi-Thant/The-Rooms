-- CreateTable
CREATE TABLE "signup_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME,
    "used_at" DATETIME,
    "used_by" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "signup_tokens_token_hash_key" ON "signup_tokens"("token_hash");
