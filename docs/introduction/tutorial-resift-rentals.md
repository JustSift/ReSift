---
id: tutorial-resift-rentals
title: Tutorial: ReSift Rentals
sidebar_label: Tutorial
---

Welcome to the ReSift tutorial. This tutorial will introduce basic ReSift concepts through building an app called _ReSift Rentals_ that lets you browse movies, kinda like Netflix. The [complete ReSift Rentals app](https://6xrby.csb.app/) has the following functionalities:

- It fetches genre data and presents the genre name and the thumbnails of the movies in each genre.
- It optimizes performance by only fetching data _when needed/in batches_.
  - In the initial load, it fetches 10 movies for each category to show their movie thumbnails. It’ll fetch the next batch of 10 movies when you scroll past the previous batch.
  - In the genre fetch, it only fetches the movie data needed for movie thumbnail (movie id, name, and imageUrl). When you hover over or click the thumbnail is when it’ll fetch the rest of the movie data, such as synopsis, preview url, etc.
- It provides consistency when the movie information is updated—when the movie information is edited in the editing dialog, that information gets updated globally, allowing the information in the movie drawer to change accordingly.
- It responds to users’ actions instantly by giving them indications about the data loading status.

## Before We Start the Tutorial

In making of this tutorial, we assume that you have basic understanding of React and React Hooks. To gain this knowledge, we recommend following the [React tutorial](https://reactjs.org/tutorial/tutorial.html) and [this post that explains React Hooks](https://www.robinwieruch.de/react-hooks).

We used a few third party libraries to help with certain functionalities and we’ll introduce them when they are being used, you do not need prior knowledge about them.

This tutorial is divided into 8 sections with each introduces different ReSift concepts. Every section has their own starter code and finished code. The starter code has the needed components and styling already provided so we can focus on introducing data fetches using ReSift. The following list is a quick glance of each section and the main concepts they introduce. You can pick and choose the concepts you’d like to understand and start at any sections. Instead of following the tutorial, you can also look at the finished code as examples of using ReSift.

**[Setup & Overview](#setup-overview)**</br>
Gives a starting point to follow the tutorial.

**[Section 1: Making Your First Fetch – Fetch Genres and Display Loading Indicator](#section-1-making-your-first-fetch-fetch-genres-and-display-loading-indicator)**</br>
Main concepts: Singleton data fetch, dispatch data, and indicate loading status
Main ReSift API introduced: `defineFetch` , `useFetch`, `useDispatch`, `isNormal`, `isLoading`, `status`

**[Section 2: Display Movies in Each Genre](#section-2-display-movies-in-each-genre)**</br>
Main concepts: Generate unique genre fetch instances via the same fetch factory
Main ReSift API introduced: `key`

**[Section 3: Infinite Scrolling & Pagination](#section-3-infinite-scrolling-pagination)**</br>
Main concepts: Fetch data in batches and merge data in the current fetch with data from the previous fetches
Main ReSift API introduced: `merge`

**[Section 4: Display Movie Info in a Movie Drawer](#section-4-display-movie-info-in-a-movie-drawer)**</br>
Main concepts: Generate unique movie fetch instances via one fetch factory
Main ReSift API introduced: Practice similar concepts as section 2

**[Section 5: Fetch Movie Data when Hovering over Movie Thumbnail](#section-5-fetch-movie-data-when-hovering-over-movie-thumbnail)**</br>
Main concepts: Dispatch fetch when events fired
Main ReSift API introduced: `useDispatch`

**[Section 6: Edit Movie](#section-6-edit-movie)**</br>
Main concepts: Creating a fetch factory to update movie info and keeping that info in sync
Main ReSift API introduced: `share`

**[Section 7: Compose Custom Hooks](#section-7-compose-custom-hooks)**</br>
Main concepts: Improve code clarity through composing custom hooks
Main ReSift API introduced: How ReSift uses hooks

**[Section 8: Create a Mock API using the ReSift HTTP Proxy](#section-8-create-a-mock-api-using-the-resift-http-proxy)**</br>
Main concepts: Set up mock api endpoints
Main ReSift API introduced: `createHttpProxy`

**[Where to Go from Here](#where-to-go-from-here)**</br>
Provides some additional exercises and examples of using ReSift

And at point of this tutorial you run into any hurdle, please don't be hesitant to leave us an issue.

Now let's dive in!
![dive in](https://media.giphy.com/media/1lxkgpEvs7pmlddf9D/giphy.gif)

## Setup & Overview

This project was bootstrapped with [create-react-app](https://create-react-app.dev/).

You can follow along in two ways:

1. Spin up via your own localhost: After [cloning the repo](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/starter/first-fetch), you can cd into the project directory and do `npm install` to install all the packages and then run `npm start` to see the project running on `localhost: 3000`. Or
2. by forking [the codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section1-starter-csicp) we have set up for you.

This is what you'll see now:

![](https://paper-attachments.dropbox.com/s_E201718DD88493055F02F9925295135B6353424DF01927749BEC4071F9BBE8D3_1569864556191_initial+start.png)

Right now there’s nothing but a header. We’ll be writing in the `/src` folder during this tutorial. Let’s inspect our starter code in there:

### Folder Structure

- `src/index.js` is the entry point for our react code.
- `src/App.js` is the base file for component imports.
- `src/mockApi` holds our [mockApi](#mockapi) that provides data fetching endpoints.
- `src/components` that holds our [components](#components).

### MockApi

We have created a mock API to serve as the HTTP proxy of our app, it's at `/src/mockApi`. The data this mockApi grabs was scrapped from IMDB’s first 50 pages of movies (sorted by most recent). The reason we’re not calling the actual IMDB api is that we don’t want to generate that many api calls to IMDB . You do not need to understand how to set up the mockApi in order to continue with the tutorial. But if you’re interested, you can head over to the [last section](http://localhost:13654/docs/introduction/tutorial-resift-rentals#section-8-use-resift-http-proxy-for-mocking-up-the-ui-when-the-backend-endpoints-are-not-ready) of this tutorial where we walked through its mechanism.

To get started with the tutorial, all you need to know is that there are three endpoints with this API:

1. `/genres`: returns an array of genres with this shape:

   ```js
   genres: Genre[];

   Genre: {
    id: string,
    name: string,
   }
   ```

2. `/genre/:id/movies`: returns an object with an array of movies and a pagination meta object with this shape:

   ```js
   movies: {
    results: Movie[],
    paginationMeta: {
      pageSize: number
      currentPageNumber: number,
      totalNumberOfPages: number,
    },
   };

   Movie: {
    id: string,
    name: string,
    imageUrl: string
   }
   ```

3. `/movies/:id`: returns a movie object with this shape:
   ```js
   movie: {
     id: number,
     name: string,
     imageUrl: string,
     posterUrl: string,
     synopsis: string,
     genres: string[],
     actors: string[],
     mpaaRating: string,
     trailerUrl: string,
     tomatoScore: number,
     theaterReleaseDate: string,
     runtime: string,
   }
   ```

### Components

This finished app consists of the following presentational components:

- An `App` component as the base for component imports.
- An `AppBar` component at the top of the app viewport.
- Multiple `Genre` components, each displays the genre's name a list of thumbnails of the movies in this genre.
- Multiple `MovieThumbnail` components, each displays the movie's name and an image of the movie.
- Multiple `MovieDrawer` components, each displays the detailed information of the selected movie.
- Multiple `MovieForm` components, each displays a form that allows you to edit the movie information.

![Genre & Movie Thumbnail](assets/component_sketch_genre.jpg)
![Movie Drawer](assets/component_sketch_movie_drawer.jpg)
![Edit Movie Form](assets/component_sketch_movie_form.jpg)

### Styles

We use [classNames](https://github.com/JedWatson/classnames), a utility library to join JSX classes. So instead of doing `classNames={[someClassName, someOtherClassName].join(' ')`, we can just do `classNames(someClassName, someOtherClassName)`.

We use [JSS](https://cssinjs.org/?v=v10.0.0), a library that allows writing CSS code directly in JavaScript files to compose our css styles. We also use components from [Material-UI](https://material-ui.com/), a library for react UI components, such as [Buttons](https://material-ui.com/components/buttons/). Since Material-UI uses JSS under the hood, JSS is automatically installed after you install material-ui via this command `npm install @material-ui/core`.

Let’s look at some basic usage of JSS that’ll help you understand how styles are being applied in this codebase.

Take the `AppBar` component for example, adding styles with JSS looks like this:

```js
// AppBar.js
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
// {makeStyles} allows you to make a block to add css styles, it can take in `theme` as an
// argument, which would allow you to access some pre-existing material-ui styles.

const useStyles = makeStyles(theme => ({
  // The convention is to name the makeStyles block `useStyles`. In useStyles,
  // we would normally define a root class first, and define other classes afterwards.
  root: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rebeccapurple',
  },
  // Property values need to be in quotations, except for px values.
  header: {
    color: 'white',
    fontWeight: 'bold',
  },
}));

function AppBar() {
  const classes = useStyles();
  // It's a convention to add this line, which allows us to call the classes defined
  // in the useStyles object as `classes.className`
  return (
    <header className={classes.root}>
      <h1 className={classes.header}>ReSift Rentals</h1>
    </header>
  );
}
export default AppBar;
```

Now you have all the knowledge you need to use material-ui and JSS for this project. Basically in order to use JSS, you’d define styles in an object called ‘useStyles’ on the top level, and then use the defined classes directly by accessing them via their key, e.g. `className={classes.root}`.

### ReSift Imports

You'd import the ReSift functions you need in curly braces. For example, `import { createHttpProxy } from 'resift'` or `import { useFetch, useDispatch } from 'resift'`.

That's all for set up, let's go make our first fetch!
