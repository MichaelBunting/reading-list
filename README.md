# Reading List Coding Assessment

## Overview

This coding assessment is built using Next.js, React, Prisma, Typescript, and SQLite to create a reading list management web app. Testing is built with React Testing Libray and Jest.

## Installation and Setup

Create a `.env` file with the following:

```
DATABASE_URL="file:./dev.db"
```

From the root of the project:

```bash
# Install npm dependencies
yarn

# Generate types for Schema and push to db
yarn prisma generate && yarn prisma db push

# Start Next.js server
yarn dev
```

The project home page should now open at `http://localhost:3000`

### Running tests

Test are currently run either with:
* `yarn jest` - runs the whole suite once
* `yarn test` - runs the whole suite in watch mode and re-runs when test files change

## Code Structure

* `./__mocks__` - Folder for Jest mocks
* `./prisma` - Folder containing files for DB Schema and migrations
* `./src` - Folder containing source JS/CSS files
  * `./src/components` - Folder for components for pages
    * Each component is a folder containing an `index.tsx` file
    * Any custom css is included in a `styles.module.css` file in that folder
    * Any tests are included in a `index.test.tsx` file
  * `./src/pages` - Folder containing Next.js page and API files
    * `./src/pages/api/*` - Folders and files for API routes
    * `./src/pages/*` - Folders and files for all other routes/pages
  * `./src/styles` - Global css

## My One Additional Feature

For my additional feature, I decided to add the ability to add reading notes to a book in a reading list. I defined a new one-to-many
relationship between a list item and a note, and then added new UI in React for it. The notes section could be used to track a user's
thoughts as they read through a book, and displays timestamps to help emphasis a timeline of the thoughts.

## My Thoughts

I tried to maintain a more ad-hoc approach to how data and UI are managed in the app. I personally have always preferred apps that seem
to update instantaneously and have more intuitive ways of updating data instead of the standard modal and/or form every time. I took the
time to try and show multiple different ways of approaching data management through more unique UI tricks while still maintaining strong
typing and proper state management.
