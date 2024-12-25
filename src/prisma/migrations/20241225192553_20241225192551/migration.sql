-- CreateIndex
CREATE INDEX "EmailAddress_emailAddress_idx" ON "EmailAddress"("emailAddress");

-- CreateIndex
CREATE INDEX "EmailAddress_userId_idx" ON "EmailAddress"("userId");

-- CreateIndex
CREATE INDEX "Listing_published_idx" ON "Listing"("published");
