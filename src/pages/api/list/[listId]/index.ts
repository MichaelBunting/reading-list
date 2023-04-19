import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '~/lib/prisma';

import type { List } from '~/types';

export type UpdateListData = {
  list?: List;
  success: boolean;
  msg?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateListData>
) {
  if (req.method === 'GET') {
    if (!req.query.listId) {
      return res.status(400).json({
        success: false,
        msg: 'ListID is required',
      });
    }

    const list = await prisma.list.findFirst({
      where: {
        id: Number(req.query.listId),
      },
      include: {
        books: {
          include: {
            book: true,
            list: true,
            notes: true,
          },
        },
      },
    });

    if (!list) {
      return res.status(400).json({
        success: false,
        msg: `Could not find list with id ${req.query.listId}`,
      });
    }

    return res.status(200).json({
      success: true,
      list,
    });
  } else if (req.method === 'PATCH') {
    const listId = req.query.listId;

    if (!listId) {
      res.status(400).json({
        success: false,
        msg: `ListID is required to update list.`,
      });
    }

    const list = await prisma.list.update({
      where: {
        id: Number(listId),
      },
      data: {
        name: req.body.name,
      },
      include: {
        books: true,
      },
    });

    res.status(200).json({
      success: true,
      list: list,
    });
  } else if (req.method === 'DELETE') {
    if (!req.query.listId) {
      return res.status(400).json({
        success: false,
        msg: 'ListID is required to delete list.'
      });
    }

    const list = await prisma.list.findFirst({
      where: {
        id: Number(req.query.listId),
      },
    });

    if (!list) {
      return res.status(204).end();
    }

    const deletedList = await prisma.list.delete({
      where: {
        id: list.id,
      },
    });

    return res.status(200).json({
      success: true,
      list: deletedList,
    });
  } else {
    res.status(405);
  }
}