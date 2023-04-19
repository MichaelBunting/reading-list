import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '~/lib/prisma';

import type { ListBookInclude, APIBaseResponse } from '~/types';
import { Status } from '~/types';

export type CreateListBookData = APIBaseResponse & {
  book?: ListBookInclude;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateListBookData>
) {
  if (req.method === 'POST') {
    const bookData = { ...req.body, ...req.query };

    if (!bookData || !bookData.title || !bookData.author || !bookData.isbn || !bookData.listId) {
      return res.status(400).json({
        success: false,
        msg: 'Some information for adding a book is missing',
      });
    }

    let currentBook = await prisma.book.findFirst({
      where: {
        isbn: bookData.isbn,
      },
    });

    if (!currentBook) {
      currentBook = await prisma.book.create({
        data: {
          title: bookData.title,
          isbn: bookData.isbn,
          author: bookData.author,
        },
      });
    }

    let listBook = await prisma.listBook.findFirst({
      where: {
        bookId: currentBook.id,
        listId: parseInt(bookData.listId, 10),
      },
      include: {
        book: true,
      },
    });
    
    if (!listBook) {
      listBook = await prisma.listBook.create({
        data: {
          listId: parseInt(bookData.listId, 10),
          bookId: currentBook.id,
          status: Status.Unread.toString(),
        },
        include: {
          book: true,
          list: true,
        },
      });
    }
    
    res.status(200).json({
      success: true,
      book: listBook,
    });
  } else {
    res.status(405);
  }
}