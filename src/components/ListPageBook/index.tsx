import { Tooltip } from 'react-tooltip';
import Modal from 'react-modal';

import React, { useState, useReducer, useRef } from 'react';

import CloseIcon from '@/icons/close.svg';
import PlusIcon from '@/icons/plus.svg';

import type { ListBookInclude } from '~/types';
import { Status } from '~/types';

import EditButton from '~/components/EditButton';
import Button from '~/components/Button';
import renderStatusIcon from '~/helpers/renderStatusIcon';

import styles from './styles.module.css';

type ListPageBookProps = {
  book: Required<ListBookInclude>;
  handleDeleteBook(bookData: ListBookInclude): void;
}

type BookReducerState = {
  status: string;
  title: string;
  author: string;
  isbn: string;
}

type BookAction = {
  type: 'UPDATE_BOOK_DATA',
  payload: {
    key: keyof BookReducerState;
    value: BookReducerState[keyof BookReducerState];
  };
}

const bookDataReducer = (state: BookReducerState, action: BookAction) => {
  if (action.type === 'UPDATE_BOOK_DATA') {
    return {
      ...state,
      [action.payload.key]: action.payload.value,
    };
  }

  return state;
};

const renderStatusOptions = () => {
  const statusData: {[key: string]: number} = {};

  Object.entries(Status).forEach(([statusKey, statusValue]) => {
    if (typeof statusValue === 'number') {
      statusData[statusKey] = statusValue;
    }
  });

  return Object.entries(statusData).map(([statusName, statusValue]) => (
    <option key={statusValue} value={statusValue}>
      {statusName.replace('_', ' ')}
    </option>
  ));
}

const ListPageBook = ({ book, handleDeleteBook }: ListPageBookProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bookData, bookDataDispatch] = useReducer(bookDataReducer, {
    status: book.status,
    title: book.book?.title || '',
    author: book.book?.author || '',
    isbn: book.book?.isbn || '',
  });
  const [notes, setNotes] = useState(book.notes);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const noteField = useRef<HTMLTextAreaElement>(null);

  const handleUpdateBook = async () => {
    await fetch(`/api/list/${book.id}/book/${book.book?.id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const handleUpdateBookState = (e: React.FocusEvent<HTMLElement>, dataKey: keyof BookReducerState) => {
    const element = e.currentTarget;
    const data = element.textContent?.trim() || '';

    bookDataDispatch({
      type: 'UPDATE_BOOK_DATA',
      payload: {
        key: dataKey,
        value: data,
      },
    });
  };

  const handleBookDelete = async () => {
    const deleteBookRequest = await fetch(`/api/list/${book.list?.id}/book/${book.book?.id}`, {
      method: 'DELETE',
    });
    
    if (deleteBookRequest.status === 200) {
      const deleteBookResponse = await deleteBookRequest.json();

      if (deleteBookResponse.success) {
        handleDeleteBook(deleteBookResponse.book);
      }
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;

    bookDataDispatch({
      type: 'UPDATE_BOOK_DATA',
      payload: {
        key: 'status',
        value: newVal,
      },
    });

    handleUpdateBook();
  }

  const handleAddNote = async () => {
    const noteVal = noteField.current?.value;

    if (!noteVal) return;

    const addNoteRequest = await fetch(`/api/list/${book.listId}/book/${book.bookId}/note`, {
      method: 'POST',
      body: JSON.stringify({
        note: noteVal,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const addNoteResponse = await addNoteRequest.json();

    if (addNoteResponse.success) {
      const notesCopy = [...notes];
      notesCopy.push(addNoteResponse.note)

      setNotes(notesCopy);
      setNotesModalOpen(false);
    }
  };

  return (
    <div className={`${styles.root} ${isEditing ? `bg-neutral-700 shadow-xl` : 'bg-neutral-800 shadow-md'} p-5 rounded-lg flex gap-5 transition relative`} data-testid="root">
      <div className="absolute top-0 right-0 mt-3 mr-5 text-sm text-neutral-500">
        {new Date(book.createdAt).toLocaleDateString('en-US')}
      </div>
      <div className="flex justify-center items-center">
        {renderStatusIcon(bookData.status, {
          width: 35,
          height: 35,
          'data-tooltip-id': 'statusIconTooltip',
          'data-tooltip-content': Status[parseInt(bookData.status)].toString().replace('_', ''),
        })}
        <Tooltip id="statusIconTooltip" />
      </div>
      <div className="w-6/12">
        <div className="flex flex-col gap-0.5 flex-1">
          <h4
            className="text-xl font-bold overflow-hidden whitespace-nowrap text-ellipsis"
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleUpdateBookState(e, 'title')}
          >
            {bookData.title}
          </h4>
          <div className="flex gap-2 items-center">
            <span className="text-sm">By</span>
            <strong
              className="text-sm"
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleUpdateBookState(e, 'author')}
            >
              {bookData.author}
            </strong>
          </div>
          <div
            className="text-sm italic"
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleUpdateBookState(e, 'isbn')}
          >
            {bookData.isbn}
          </div>
          <div className="flex flex-wrap w-full gap-1">
            {notes.map((note) => (
              <div className="w-full text-xs flex gap-2" key={note.id}>
                <div>
                  &quot;{note.note}&quot;
                </div>
                <span>-</span>
                <div className="text-neutral-400 font-bold">
                  {new Date(note.createdAt).toLocaleDateString('en-US')}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1">
            <Button type="button" size="sm" className="flex items-center gap-1" onClick={() => { setNotesModalOpen(true) }} data-testid="addNoteBtn">
              <PlusIcon width="10" height="10" />
              Add Note
            </Button>
            <Modal
              isOpen={notesModalOpen}
              style={{
                overlay: {
                  backgroundColor: 'rgba(38, 38, 38, 0.5)'
                },
                content: {
                  maxWidth: 450,
                  minHeight: 'none',
                  height: 'fit-content',
                  transform: 'translate(-50%, -50%)',
                  top: '50%',
                  left: '50%',
                  backgroundColor: '#d4d4d4',
                  border: 'none',
                  color: '#171717',
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
              ariaHideApp={false}
            >
              <h4 className="font-bold text-center">Add Notes</h4>
              <textarea className="w-full rounded-md p-3 mt-3" placeholder="Enter Notes Here..." rows={5} ref={noteField} data-testid="addNoteTextarea"></textarea>
              <Button type="button" variant="light" className="mt-3" onClick={handleAddNote} data-testid="submitNoteBtn">
                Add Note
              </Button>
              <button type="button" className="m-0.5 p-0.5 absolute top-0 right-0 rounded-full hover:bg-neutral-400 transition" data-testid="addNoteModalCloseBtn" onClick={() => { setNotesModalOpen(false) }}>
                <CloseIcon width="20" height="20" />
              </button>
            </Modal>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {isEditing && (
          <select defaultValue={bookData.status} className="w-full bg-neutral-700" onChange={handleStatusChange} data-testid="statusDropdown">
            {renderStatusOptions()}
          </select>
        )}
      </div>
      <div className="flex-1 flex items-center justify-end gap-5">
        <EditButton
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          callback={handleUpdateBook}
          iconSize={{ width: 25, height: 25 }}
          className="rounded-full bg-neutral-600 flex justify-center items-center hover:bg-neutral-500 transition"
          data-testid="editBtn"
        />
        <button type="button" className="rounded-full bg-neutral-600 flex justify-center items-center hover:bg-neutral-500 transition w-[35px] h-[35px]" onClick={handleBookDelete} data-testid="deleteBtn">
          <CloseIcon width="25" height="25" />
        </button>
      </div>
    </div>
  )
};

export default ListPageBook;