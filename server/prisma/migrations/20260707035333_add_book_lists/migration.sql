-- CreateTable
CREATE TABLE "book_lists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "cover" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "book_lists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "book_list_books" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookListId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "book_list_books_bookListId_fkey" FOREIGN KEY ("bookListId") REFERENCES "book_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "book_list_books_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "book_list_books_bookListId_bookId_key" ON "book_list_books"("bookListId", "bookId");
