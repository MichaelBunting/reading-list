import React, { useState } from 'react';
import Modal from 'react-modal';
import { Lato } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { stringify } from 'yaml';

import prisma from '~/lib/prisma';
import ListPageBook from '~/components/ListPageBook';
import EditButton from '~/components/EditButton';
import Button from '~/components/Button';
import AddBookForm, { NewBookState } from '~/components/AddBookForm';

import CloseIcon from '@/icons/close.svg';

import styles from './styles.module.css';

import type { ListBookInclude, ListInclude } from '~/types';

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--lato',
});

type ListProps = {
  list?: ListInclude;
}

type SortKeys = 'createdAt' | 'alphabetical' | 'status';
type SortDescriptor = 'asc' | 'desc' | 'title' | 'author';
type SortString = `${SortKeys}:${SortDescriptor}`;

type ExportFormats = 'yaml' | 'pantry';

const getSortedBook = (sortString: SortString, books: Required<ListBookInclude>[]) => {
  const [dataKey, sortVal] = sortString.split(':') as [SortKeys, SortDescriptor];
  const booksCopy = [...books];
  let newBooks;

  if (dataKey === 'createdAt') {
    if (sortVal === 'asc') {
      newBooks = booksCopy.sort((a, b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } else if (sortVal === 'desc') {
      newBooks = booksCopy.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  } else if (dataKey === 'alphabetical') {
    if (sortVal === 'title') {
      newBooks = booksCopy.sort((a, b) => a.book.title.localeCompare(b.book.title));
    } else if (sortVal === 'author') {
      newBooks = booksCopy.sort((a, b) => a.book.author.localeCompare(b.book.author));
    }
  } else if (dataKey === 'status') {
    newBooks = booksCopy.sort((a, b) => a.status.localeCompare(b.status));
  }

  return newBooks;
};

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(38, 38, 38, 0.5)'
  },
  content: {
    maxWidth: 350,
    height: 'fit-content',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    left: '50%',
    backgroundColor: '#d4d4d4',
    border: 'none',
    color: '#171717',
  },
};

export default function List({ list }: ListProps) {
  const [books, setBooks] = useState(list?.books || []);
  const [listName, setListName] = useState(list?.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [exportModalIsOpen, setExportModalIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'yaml' | 'pantry'>('yaml');
  const [pantryId, setPantryId] = useState('');
  const [basketId, setBasketId] = useState('');
  const router = useRouter();

  const handleEditingName = async () => {
    if (isEditingName) {
      setIsEditingName(false);
      await fetch(`/api/list/${list?.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: listName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      setIsEditingName(true);
    }
  };

  const handleAddBook = async (newBookData: NewBookState) => {
    if (newBookData.title && newBookData.author && newBookData.isbn) {
      const addBookToListRequest = await fetch(`/api/list/${list?.id}/book`, {
        method: 'POST',
        body: JSON.stringify({
          title: newBookData.title,
          author: newBookData.author,
          isbn: newBookData.isbn,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const addBookToListResponse = await addBookToListRequest.json();

      if (addBookToListResponse.success) {
        const booksCopy = [...books];
        booksCopy.unshift(addBookToListResponse.book);
        setBooks(booksCopy);
        setAddModalIsOpen(false);
      }
    }
  };

  const handleDeleteBook = (deletedBook: ListBookInclude) => {
    const booksCopy = [...books];
    const bookToDeleteIndex = booksCopy.findIndex((book) => book.id === deletedBook.id);
    booksCopy.splice(bookToDeleteIndex, 1);

    setBooks(booksCopy);
  };

  const handleDeleteList = async () => {
    const deleteListRequest = await fetch(`/api/list/${list?.id}`, {
      method: 'DELETE',
    });

    if (deleteListRequest.status === 200) {
      router.push('/');
    }
  };

  const handleBookSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value as SortString;
    const newBooks = getSortedBook(newVal, books);

    if (newBooks) {
      setBooks(newBooks);
    }
  }

  const handleExport = async () => {
    const exportDataRequest = await fetch(`/api/list/${list?.id}`);
    const exportDataResponse = await exportDataRequest.json();
    
    if (!exportDataResponse.success) return;

    const listResponse = exportDataResponse.list as ListInclude;

    const listData = {
      ...listResponse,
      books: listResponse.books.map((book) => ({
        ...book.book,
        notes: book.notes,
      })),
    };

    if (exportFormat === 'yaml') {
      const yamlData = stringify(listData);
      const blob = new Blob([yamlData], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const tempElement = document.createElement('a');
      tempElement.href = url;
      tempElement.setAttribute('download', `${listName} Reading List.yaml`);
      tempElement.click();
    } else if (exportFormat === 'pantry') {
      if (pantryId && basketId) {
        const pantryRequest = await fetch(`https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${basketId}`, {
          method: 'POST',
          body: JSON.stringify(listData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (pantryRequest.status === 200) {
          alert(`Pantry Basket ${basketId} has been updated.`);
          setPantryId('');
          setBasketId('');
        } else {
          const pantryResponse = await pantryRequest.text();
          alert(`There was an error updating your pantry basket: ${pantryResponse}`);
        }
      }
    }
  }

  const handlePantryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    
    if (input.name === 'pantryID') {
      setPantryId(input.value);
    } else {
      setBasketId(input.value);
    }
  };

  if (!list) return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${lato.variable}`}>
      <h1>No list found</h1>
    </main>
  )

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${lato.variable} ${styles.root}`}>
      <div className="max-w-5xl w-full">
        <Link href="/" className="font-bold pl-5">
          &lsaquo; Home
        </Link>
        <div className="p-5 pt-0 mt-5 border-0 border-b-2 border-solid border-neutral-500 flex items-center gap-5">
          <h1 className={`text-left text-4xl font-bold ${lato.className} rounded-lg`} contentEditable={isEditingName} suppressContentEditableWarning={true} onBlur={(e) => { setListName(e.currentTarget.textContent?.trim()) }}>{listName}</h1>
          <div className="flex-1">
            <EditButton
              isEditing={isEditingName}
              setIsEditing={setIsEditingName}
              callback={handleEditingName}
              className="rounded-full bg-neutral-600 flex justify-center items-center hover:bg-neutral-500 transition"
            />
          </div>
          <span className="text-lg text-neutral-300">{new Date(list?.createdAt).toLocaleDateString('en-US')}</span>
        </div>
        <div className="p-5 flex gap-5 items-center">
          <div className="w-2/12">
            <Button type="button" variant="danger" onClick={handleDeleteList}>Delete List</Button>
          </div>
          <div className="w-2/12">
            <Button type="button" onClick={() => { setAddModalIsOpen(true) }}>Add Book</Button>
            <Modal
              isOpen={addModalIsOpen}
              onRequestClose={() => { setAddModalIsOpen(false) }}
              ariaHideApp={false}
              style={modalStyles}
            >
              <AddBookForm
                onSubmit={handleAddBook}
                onClose={() => { setAddModalIsOpen(false) }}
              />
            </Modal>
          </div>
          <div className="w-2/12">
            <Button type="button" onClick={() => { setExportModalIsOpen(true) }}>
              Export List
            </Button>
            <Modal
              isOpen={exportModalIsOpen}
              onAfterOpen={() => {
                setPantryId('');
                setBasketId('');
                setExportFormat('yaml');
              }}
              onRequestClose={() => { setExportModalIsOpen(false) }}
              ariaHideApp={false}
              style={modalStyles}
            >
              <button type="button" className="m-0.5 p-0.5 absolute top-0 right-0 rounded-full hover:bg-neutral-400 transition" onClick={() => { setExportModalIsOpen(false) }}>
                <CloseIcon width="20" height="20" />
              </button>
              <h2 className="font-bold text-center">Export List</h2>
              <div className="flex flex-col gap-2 py-1">
                <span className="text-xs font-bold">Export Format:</span>
                <select className="rounded-md p-1" value={exportFormat} onChange={(e) => { setExportFormat(e.target.value as ExportFormats) }}>
                  <option value="yaml">
                    YAML
                  </option>
                  <option value="pantry">
                    Pantry
                  </option>
                </select>
              </div>
              {exportFormat === 'pantry' && (
                <div className="flex gap-2 py-2 flex-1">
                  <div className="flex flex-col gap-2 w-6/12">
                    <span className="text-xs font-bold">Pantry ID:</span>
                    <input type="text" name="pantryID" className="p-1 rounded-md w-full" onChange={handlePantryChange} value={pantryId} />
                  </div>
                  <div className="flex flex-col gap-2 w-6/12">
                    <span className="text-xs font-bold">Baket ID:</span>
                    <input type="text" name="basketId" className="p-1 rounded-md w-full" onChange={handlePantryChange} value={basketId} />
                  </div>
                </div>
              )}
              <div className="flex justify-center py-2">
                <Button type="button" variant="light" onClick={handleExport}>
                  Export
                </Button>
              </div>
            </Modal>
          </div>
          <div className="flex-1 flex items-center justify-end">
            Sort:
            <select className="bg-transparent p-1 px-2 border-2 border-neutral-600 rounded-md ml-2" defaultValue="createdAt:desc" onChange={handleBookSort}>
              <option value="createdAt:desc" className="bg-neutral-600">
                Date: Newest to Oldest
              </option>
              <option value="createdAt:asc" className="bg-neutral-600">
                Date: Oldest to Newest
              </option>
              <option value="alphabetical:title" className="bg-neutral-600">
                Alphabetical: Title
              </option>
              <option value="alphabetical:author" className="bg-neutral-600">
                Alphabetical: Author
              </option>
              <option value="status" className="bg-neutral-600">
                Status
              </option>
            </select>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-5">
          {books && books.length > 0 ? books.map((book) => (
            <ListPageBook key={book.id} book={book} handleDeleteBook={handleDeleteBook} />
          )) : (
            <div className="w-full text-center">
              No books in list...
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export async function getServerSideProps({ params }: { params: { listId: string } }) {
  const list = await prisma.list.findFirst({
    where: {
      id: parseInt(params.listId.toString(), 10),
    },
    include: {
      books: {
        include: {
          book: true,
          list: true,
          notes: true,
        },
        orderBy: {
          createdAt: 'desc',
        }
      },
    },
  });

  return {
    props : { list: JSON.parse(JSON.stringify(list)) }
  }
}
