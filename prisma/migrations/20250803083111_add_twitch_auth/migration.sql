-- CreateTable
CREATE TABLE "TwitchAuth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accessToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "tokenType" TEXT NOT NULL DEFAULT 'Bearer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
-- CreateIndex
CREATE INDEX "TwitchAuth_expiresAt_idx" ON "TwitchAuth"("expiresAt");
