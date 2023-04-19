import { Lato } from 'next/font/google';
import { Prisma } from '@prisma/client';

import ReadingList from '~/components/ReadingList';
import Input from '~/components/Input';
import Plus from '@/icons/plus.svg';
import React, { useState } from 'react';
import prisma from '~/lib/prisma';

import type { ListInclude } from '~/types';

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--lato',
});

type HomeProps = {
  lists?: ListInclude[];
}

export default function Home({ lists }: HomeProps) {
  const [readingLists, setReadingLists] = useState<ListInclude[]>(lists || []);

  const handleNewReadingList = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formElements = form.elements;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const formInput = [...formElements].find((element) => (element instanceof HTMLInputElement));

    if (data.name) {
      const listData: Prisma.ListCreateInput = {
        name: data.name as string,
      };
      const createListRequest = await fetch('/api/list', {
        method: 'POST',
        body: JSON.stringify(listData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (createListRequest.status !== 200) {
        const createListResponse = await createListRequest.json();
        alert(`Error creating list: \n ${createListResponse.msg}`);
        return;
      }

      const createListResponse = await createListRequest.json();

      if (createListResponse.success && createListResponse.list) {
        const readingListCopy = [...readingLists];
        readingListCopy.unshift(createListResponse.list)
        setReadingLists(readingListCopy);
        
        if (formInput && formInput instanceof HTMLInputElement) formInput.value = '';
      }
    }

    return false;
  }

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${lato.variable}`}>
      <div className="max-w-5xl w-full">
        <div className="p-5 border-0 border-b-2 border-solid border-neutral-500">
          <h1 className={`text-left text-4xl font-bold ${lato.className}`}>Reading List</h1>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          <form className="block p-3 rounded-lg border-2 border-neutral-500 flex flex-col" onSubmit={handleNewReadingList}>
            <div>
              <Input
                type="text"
                name="name"
                placeholder="Reading List Title..."
                className="text-lg"
              />
            </div>
            <div className="flex-1 min-h-[170px]">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
            <div className="text-center flex justify-center">
              <button type="submit" className="rounded-full w-10 h-10 text-white bg-neutral-700 inline-block flex items-center justify-center transition hover:bg-neutral-500">
                <Plus width="24" height="24" />
              </button>
            </div>
          </form>

          {readingLists && readingLists.map((readingList) => (
            <ReadingList key={readingList.id} list={readingList} />
          ))}
        </div>
      </div>
    </main>
  )
}

export async function getStaticProps() {
  const lists = await prisma.list.findMany({
    orderBy: [{
      createdAt: 'desc',
    }],
    include: {
      books: {
        include: {
          book: true,
        },
        orderBy: {
          createdAt: 'desc',
        }
      },
    },
  });

  return {
    props : { lists: JSON.parse(JSON.stringify(lists)) }
  }
}
