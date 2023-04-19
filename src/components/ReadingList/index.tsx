import { useReducer, useState } from 'react';
import Link from 'next/link';

import Button from '~/components/Button';
import Input from '~/components/Input';
import Book from '~/components/Book';

import Close from '@/icons/close.svg';

import styles from './styles.module.css';

import type { ListInclude, ListBookInclude } from '~/types';

type ReadingListProps = {
  list: ListInclude & {
    books?: ListBookInclude[],
  };
};

type NewBookState = {
  title: string;
  author: string;
  isbn: string;
};

type NewBookAction =
| {
  type: 'UPDATE_FIELD';
  payload: {
    key: keyof NewBookState;
    value: string;
  }
}
| {
  type: 'CLEAR_FIELDS';
}

const reducer = (state: NewBookState, action: NewBookAction) => {
  if (action.type === 'UPDATE_FIELD') {
    return {
      ...state,
      [action.payload.key]: action.payload.value,
    };
  } else if (action.type === 'CLEAR_FIELDS') {
    return {
      title: '',
      author: '',
      isbn: '',
    }
  } else {
    return state;
  }
}

const ReadingList = ({ list }: ReadingListProps) => {
  const [books, setBooks] = useState<ListBookInclude[]>(list.books || []);
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBookData, dispatchNewBookData] = useReducer(reducer, {
    title: '',
    author: '',
    isbn: '',
  });

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newBookData.title && newBookData.author && newBookData.isbn) {
      const body = {
        title: newBookData.title,
        author: newBookData.author,
        isbn: newBookData.isbn,
      };

      const addBookToListRequest = await fetch(`/api/list/${list.id}/book`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (addBookToListRequest.status !== 200) {
        const addBookToListResponse = await addBookToListRequest.json();
        alert(`Error adding book to list: \n ${addBookToListResponse.msg}`);
        return;
      }

      const addBookToListResponse = await addBookToListRequest.json();

      if (addBookToListResponse.success) {
        const booksCopy = [...books];
        booksCopy.unshift(addBookToListResponse.book);
        setBooks(booksCopy);
        setShowAddBook(false);
        dispatchNewBookData({ type: 'CLEAR_FIELDS' })
      }
    }

    return false;
  }

  const handleDeleteBook = async (bookId?: ListBookInclude['id']) => {
    const deleteBookRequest = await fetch(`/api/list/${list.id}/book/${bookId}`, {
      method: 'DELETE',
    });

    if (deleteBookRequest.status === 200) {
      const deleteBookResponse = await deleteBookRequest.json();

      if (!deleteBookResponse.success) {
        alert(`Error deleting book: \n ${deleteBookResponse.msg}`);
        return;
      };

      const currentBookIndex = books.findIndex((book) => book.id === deleteBookResponse.book.id);
      const booksCopy = [...books];
      booksCopy.splice(currentBookIndex, 1);

      setBooks(booksCopy);
    } else {
      const deleteBookResponse = await deleteBookRequest.json();
      alert(`Error deleting book: \n ${deleteBookResponse.msg}`);
    }
  };

  return (
    <div className="p-3 border-2 border-neutral-500 flex flex-col rounded-lg text-neutral-300 relative overflow-hidden min-h-[300px] gap-2">
      <div className="flex items-center">
        <h4 className="font-bold text-xl flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-1">{list.name}</h4>
        <span className="italic text-sm">{new Date(list.createdAt).toLocaleDateString('en-US')}</span>
      </div>
      <div className="py-3 flex-1 h-[170px] max-h-[170px] overflow-auto flex flex-col">
        {Boolean(books.length) && books.map((book) => (
          <Book
            key={`${book.bookId}${book.listId}`}
            book={book}
            handleDeleteBook={handleDeleteBook}
          />
        ))}
      </div>
      <div>
        <Button type="button" onClick={() => { setShowAddBook(true); }}>
          Add New Book
        </Button>
      </div>
      <div>
        <Link href={`/lists/${list.id}`} className="text-center w-full block text-sm p-1 text-neutral-200">
          View List
        </Link>
      </div>
      <div className={`${styles.addBook} ${showAddBook ? styles.active : ''} p-3 flex flex-col`}>
        <h4 className="font-bold text-sm uppercase text-center">Add New Book</h4>
        <form className="flex flex-col gap-5 flex-1" onSubmit={handleAddBook}>
          <Input type="text" name="title" variant="light" placeholder="Title" className="text-md" value={newBookData.title} onChange={(e) => {
            dispatchNewBookData({
              type: 'UPDATE_FIELD',
              payload: { key: 'title', value: e.currentTarget?.value }
            })
          }} />
          <Input type="text" name="author" variant="light" placeholder="Author" className="text-md" value={newBookData.author} onChange={(e) => {
            dispatchNewBookData({
              type: 'UPDATE_FIELD',
              payload: { key: 'author', value: e.currentTarget?.value }
            })
          }} />
          <Input type="text" name="isbn" variant="light" placeholder="ISBN #" className="text-md" value={newBookData.isbn} onChange={(e) => {
            dispatchNewBookData({
              type: 'UPDATE_FIELD',
              payload: { key: 'isbn', value: e.currentTarget?.value }
            })
          }} />
          <div className="flex flex-1 justify-center items-end">
            <Button type="submit" variant="light">Add Book</Button>
          </div>
          <button type="button" className="m-0.5 p-0.5 absolute top-0 right-0 rounded-full hover:bg-neutral-400 transition" onClick={() => {
            setShowAddBook(false);
            dispatchNewBookData({ type: 'CLEAR_FIELDS' })
          }}>
            <Close width="20" height="20" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReadingList;