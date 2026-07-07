/*
  Warnings:

  - Added the required column `updatedAt` to the `reading_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `reading_progress` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reading_progress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "page" INTEGER,
    "percentage" REAL,
    "durationMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reading_progress_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reading_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_reading_progress" ("bookId", "createdAt", "durationMinutes", "id", "page", "percentage") SELECT "bookId", "createdAt", "durationMinutes", "id", "page", "percentage" FROM "reading_progress";
DROP TABLE "reading_progress";
ALTER TABLE "new_reading_progress" RENAME TO "reading_progress";
CREATE UNIQUE INDEX "reading_progress_userId_bookId_key" ON "reading_progress"("userId", "bookId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
