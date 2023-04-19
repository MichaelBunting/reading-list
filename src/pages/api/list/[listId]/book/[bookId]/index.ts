import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '~/lib/prisma';

import type { ListBookInclude, APIBaseResponse } from '~/types';

export type CreateListBookData = APIBaseResponse & {
  book?: ListBookInclude;
  books?: ListBookInclude[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateListBookData>
) {
  if (req.method === 'PUT') {
    const bookData = req.body;
    const params = req.query;

    if (!params.listId || !params.bookId) {
      return res.status(400).json({
        success: false,
        msg: 'List ID and Book ID are required to update a book.',
      });
    }

    if (!bookData.status || !bookData.title || !bookData.author || !bookData.isbn) {
      return res.status(400).json({
        success: false,
        msg: 'All Book fields including status are required to update a book.',
      });
    }

    let listBook = await prisma.listBook.findFirst({
      where: {
        id: Number(params.listId),
        bookId: Number(params.bookId),
      },
      include: {
        book: true,
        list: true,
      }
    });

    if (!listBook) {
      return res.status(400).json({
        success: false,
        msg: `Could not find book for list id provided`,
      });
    }

    listBook = await prisma.listBook.update({
      where: {
        id: listBook.id,
      },
      data: {
        status: bookData.status,
      },
      include: {
        book: true,
        list: true,
      },
    });

    const book = await prisma.book.update({
      where: {
        id: Number(params.bookId),
      },
      data: {
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
      },
    });

    listBook.book = book;

    return res.status(200).json({
      success: true,
      book: listBook as ListBookInclude,
    });
  } else if (req.method === 'DELETE') {
    if (!req.query.listId || !req.query.bookId) {
      return res.status(400).json({
        success: false,
        msg: 'List ID and Book ID are required to delete a book in a list.'
      });
    }

    const bookInList = await prisma.listBook.findFirst({
      where: {
        bookId: Number(req.query.bookId),
        listId: Number(req.query.listId),
      },
    });

    if (!bookInList) {
      return res.status(204).end();
    }

    const deletedBook = await prisma.listBook.delete({
      where: {
        id: bookInList.id,
      },
      include: {
        book: true,
        list: true,
      }
    });

    return res.status(200).json({
      success: true,
      msg: `Successfully deleted ${deletedBook.book.title} from ${deletedBook.list.name}`,
      book: deletedBook,
    });
  } else {
    res.status(405);
  }
}