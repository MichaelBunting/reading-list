import React, { useReducer } from 'react';

import Input from '~/components/Input';
import Button from '~/components/Button';

import CloseIcon from '@/icons/close.svg';

type AddBookFormProps = {
  onSubmit(data: NewBookState): void;
  onClose(): void;
}

export type NewBookState = {
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

const AddBookForm = ({
  onSubmit,
  onClose,
}: AddBookFormProps) => {
  const [newBookData, dispatchNewBookData] = useReducer(reducer, {
    title: '',
    author: '',
    isbn: '',
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(newBookData);
    return false;
  }

  return (
    <div>
      <h4 className="font-bold text-sm uppercase text-center">Add New Book</h4>
      <form className="flex flex-col gap-5 flex-1" onSubmit={handleFormSubmit}>
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
          dispatchNewBookData({ type: 'CLEAR_FIELDS' })
          onClose();
        }}>
          <CloseIcon width="20" height="20" />
        </button>
      </form>
    </div>
  );
};

export default AddBookForm;
