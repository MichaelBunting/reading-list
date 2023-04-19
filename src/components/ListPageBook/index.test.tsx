import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {expect, jest, test} from '@jest/globals';

import ListPageBook from '.';
import { act } from 'react-dom/test-utils';

const mockData = {
  "id": 28,
  "status": "2",
  "listId": 8,
  "bookId": 24,
  "createdAt": new Date("2023-04-18T02:39:14.955Z"),
  "updatedAt": new Date("2023-04-18T02:45:45.588Z"),
  "book": {
      "id": 24,
      "isbn": "12984444",
      "title": "Alpha",
      "author": "Thing",
      "createdAt": new Date("2023-04-18T02:39:14.945Z"),
      "updatedAt": new Date("2023-04-18T02:45:45.597Z")
  },
  "list": {
      "id": 8,
      "name": "Billy's List This is the List",
      "createdAt": new Date("2023-04-16T00:38:15.942Z"),
      "updatedAt": new Date("2023-04-18T02:13:44.038Z")
  },
  "notes": [
      {
          "id": 2,
          "bookId": 28,
          "note": "Notes testing",
          "createdAt": new Date("2023-04-18T20:13:19.936Z"),
          "updatedAt": new Date("2023-04-18T20:13:19.936Z")
      }
  ]
};

const setFetchMock = (requestInfo: Partial<Response>) => {
  (global.fetch as unknown) = jest.fn(() => Promise.resolve(requestInfo));
};

test('renders', async () => {
  const mockFn = jest.fn();
  await act(async () => {
    render(<ListPageBook book={mockData} handleDeleteBook={mockFn} />)
  });
});

test('toggles editing on', async () => {
  const mockFn = jest.fn();
  await act(async () => {
    render(<ListPageBook book={mockData} handleDeleteBook={mockFn} />);
  });

  const { getByTestId, getByText } = screen;
  const editBtn = await getByTestId('editBtn');

  act(() => { editBtn.click(); });

  const title = await getByText(mockData.book.title);
  const author = await getByText(mockData.book.author);
  const isbn = await getByText(mockData.book.isbn);
  const statusSelect = await getByTestId('statusDropdown');

  expect(title.getAttribute('contenteditable')).toBe('true');
  expect(author.getAttribute('contenteditable')).toBe('true');
  expect(isbn.getAttribute('contenteditable')).toBe('true');
  expect(statusSelect).toBeTruthy();
});

test('saves book updates', async () => {
  setFetchMock({
    json: () => Promise.resolve({
      success: true,
    }),
  });

  const mockFn = jest.fn();
  await act(async () => {
    render(<ListPageBook book={mockData} handleDeleteBook={mockFn} />);
  });

  const { getByTestId, getByText } = screen;
  const editBtn = await getByTestId('editBtn');
  const title = await getByText(mockData.book.title);
  const author = await getByText(mockData.book.author);
  const isbn = await getByText(mockData.book.isbn);

  await act(async () => {
    editBtn.click();
  });

  const statusDropdown = await getByTestId('statusDropdown') as HTMLSelectElement;
  const statusOption = await getByText('In Progress') as HTMLOptionElement;

  await act(async () => {
    title.focus();
    title.textContent = `${mockData.book.title}-12345`;
    title.blur();

    author.focus();
    author.textContent = `${mockData.book.author}-12345`;
    author.blur();

    isbn.focus();
    isbn.textContent = `${mockData.book.isbn}-12345`;
    isbn.blur();

    fireEvent.change(statusDropdown, { target: { value: statusOption.value } });
  });

  expect(title.textContent).toBe(`${mockData.book.title}-12345`);
  expect(author.textContent).toBe(`${mockData.book.author}-12345`);
  expect(isbn.textContent).toBe(`${mockData.book.isbn}-12345`);
  expect(statusDropdown.value).toBe(statusOption.value);

  expect(global.fetch).toHaveBeenCalled();
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`/api/list/${mockData.id}/book/${mockData.book.id}`), expect.objectContaining({
    method: 'PUT',
  }));
});

test('removes books', async () => {
  setFetchMock({
    json: () => Promise.resolve({
      success: true,
    }),
    status: 200,
  });

  const mockFn = jest.fn();
  await act(async () => {
    render(<ListPageBook book={mockData} handleDeleteBook={mockFn} />);
  });

  const { getByTestId } = screen;
  const deleteBtn = await getByTestId('deleteBtn');

  await act(() => { deleteBtn.click() });

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`/api/list/${mockData.listId}/book/${mockData.book.id}`), expect.objectContaining({
    method: 'DELETE',
  }));
});

test('adds notes', async () => {
  setFetchMock({
    json: () => Promise.resolve({
      success: true,
      note: {
        id: 1,
        note: 'This is a note',
      },
    }),
    status: 200,
  });

  const mockFn = jest.fn();
  await act(async () => {
    render(<ListPageBook book={mockData} handleDeleteBook={mockFn} />);
  });

  const { getByTestId, getByText, queryByText } = screen;
  const addNoteBtn = await getByTestId('addNoteBtn');
  
  await act(async () => { addNoteBtn.click() });

  let addNoteModalTitle;
  addNoteModalTitle = await getByText('Add Notes');

  expect(addNoteModalTitle).toBeTruthy();

  const addNoteModalCloseBtn = await getByTestId('addNoteModalCloseBtn');

  await act(async () => { addNoteModalCloseBtn.click() });

  addNoteModalTitle = await queryByText('Add Notes');

  expect(addNoteModalTitle).not.toBeTruthy();

  await act(async () => { addNoteBtn.click() });

  const noteTexarea = await getByTestId('addNoteTextarea');
  const submitNoteBtn = await getByTestId('submitNoteBtn');

  submitNoteBtn.click();

  expect(global.fetch).not.toHaveBeenCalled();

  await act(async () => {
    fireEvent.change(noteTexarea, { target: { value: 'This is a note' } });
    submitNoteBtn.click();
  })

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith(`/api/list/${mockData.listId}/book/${mockData.book.id}/note`, expect.objectContaining({
    method: 'POST',
  }));
});