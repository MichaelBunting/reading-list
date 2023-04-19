import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '~/lib/prisma';

import type { BookNote, APIBaseResponse } from '~/types';

export type CreateNotesData = APIBaseResponse & {
  note?: BookNote;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateNotesData>
) {
  if (req.method === 'POST') {
    if (!req.query.listId || !req.query.bookId) {
      return res.status(400).json({
        success: false,
        msg: 'ListID and bookID are required to add a new note',
      });
    }

    if (!req.body.note) {
      return res.status(400).json({
        success: false,
        msg: 'Note is missing',
      });
    }

    const listBook = await prisma.listBook.findFirst({
      where: {
        listId: Number(req.query.listId),
        bookId: Number(req.query.bookId),
      },
    });

    if (!listBook) {
      return res.status(400).json({
        success: false,
        msg: `Could not find list book for listId ${req.query.listId} and bookId ${req.query.bookId}`,
      });
    }

    const newNote = await prisma.bookNote.create({
      data: {
        bookId: listBook?.id,
        note: req.body.note,
      },
      include: {
        book: true,
      }
    });

    return res.status(200).json({
      success: true,
      note: newNote,
    });
  } else {
    res.status(405);
  }
}