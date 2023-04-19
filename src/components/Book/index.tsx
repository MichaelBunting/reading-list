import React from "react";

import CloseIcon from "@/icons/close.svg";

import renderStatusIcon from "~/helpers/renderStatusIcon";

import type { ListBookInclude } from "~/types";

type BookProps = {
  book: ListBookInclude;
  handleDeleteBook(bookId?: ListBookInclude['id']): void;
};

const Book = ({ book, handleDeleteBook }: BookProps) => {
  return (
    <div className="flex py-0.5 my-1 gap-2 items-center relative group">
      <div>
        {renderStatusIcon(book.status)}
      </div>
      <div className="flex-1 flex flex-wrap">
        <span className="text-sm w-full overflow-hidden text-ellipsis whitespace-nowrap ">{book.book?.title}</span>
        <span className="text-xs font-bold flex-1">{book.book?.author}</span>
        <span className="text-xs text-right">{book.book?.isbn}</span>
      </div>
      <button
        className="absolute top-0 right-0 h-full flex items-center px-2 backdrop-blur-md opacity-0 transition group-hover:opacity-100 cursor-pointer border border-solid border-transparent hover:border-neutral-500"
        onClick={() => { handleDeleteBook(book.book?.id) }}
      >
        <CloseIcon width="24" height="24" />
      </button>
    </div>
  )
};

export default Book;