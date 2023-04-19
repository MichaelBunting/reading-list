-- CreateTable
CREATE TABLE "BookNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    CONSTRAINT "BookNote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "ListBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ListBook" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "listId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ListBook_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ListBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ListBook" ("bookId", "createdAt", "id", "listId", "status", "updatedAt") SELECT "bookId", "createdAt", "id", "listId", "status", "updatedAt" FROM "ListBook";
DROP TABLE "ListBook";
ALTER TABLE "new_ListBook" RENAME TO "ListBook";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
