/*
  Warnings:

  - Added the required column `updatedAt` to the `BookNote` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookNote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "ListBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BookNote" ("bookId", "id", "note") SELECT "bookId", "id", "note" FROM "BookNote";
DROP TABLE "BookNote";
ALTER TABLE "new_BookNote" RENAME TO "BookNote";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
