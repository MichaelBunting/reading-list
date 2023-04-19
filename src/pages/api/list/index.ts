import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '~/lib/prisma';

import type { List } from '~/types';

export type CreateListData = {
  list?: List;
  success: boolean;
  msg?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateListData>
) {
  if (req.method === 'POST') {
    const listName = req.body.name;

    if (!listName) {
      return res.status(400).json({
        success: false,
        msg: 'List name is required',
      });
    }

    const newList = await prisma.list.create({
      data: {
        name: listName,
      },
      include: {
        books: true,
      },
    });

    res.status(200).json({
      success: true,
      list: newList,
    });
  } else {
    res.status(405);
  }
}