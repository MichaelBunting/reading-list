import { Prisma } from "@prisma/client";

export type APIBaseResponse = {
  success: boolean;
  msg?: string;
}

export type List = Prisma.ListGetPayload<Prisma.ListArgs>;
export type ListBook = Prisma.ListBookGetPayload<Prisma.ListBookArgs>;
export type BookNote = Prisma.BookNoteGetPayload<Prisma.BookNoteArgs>;
export type ListInclude = Prisma.ListGetPayload<{ include: { books: { include: { book: true, list: true, notes: true } } } }>;
export type ListBookInclude = Omit<Prisma.ListBookGetPayload<{ include: Prisma.ListBookInclude }>, '_count'>

export enum Status {
  Unread,
  In_Progress,
  Finished,
};
