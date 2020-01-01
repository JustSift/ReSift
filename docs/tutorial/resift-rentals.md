---
id: resift-rentals
title: Tutorial: ReSift Rentals
sidebar_label: ReSift Rentals
---

Welcome to the ReSift tutorial! (_Updated for [v0.1.0](https://github.com/JustSift/ReSift/releases/tag/v0.1.0)_)

This tutorial introduces basic ReSift concepts through building an app called _ReSift Rentals_. This app lets users to browse movies and update movie information. Click here to see the [completed ReSift Rentals app](https://35w4y.csb.app/). It has the following functionalities:

- It fetches movie genre data and presents each genre’s name and the thumbnails of the movies in them.
- It optimizes performance by only fetching the data _when needed/in batches_.
  - In the initial load, it fetches 10 movies for each genre to show their movie thumbnails. It’ll fetch the next batch of 10 movies when the user clicks to load more.
  - When fetching a genre, it only fetches the movie data needed for the movie thumbnails (id, name, and imageUrl). When the user hovers over or clicks on the thumbnail, it’ll fetch the rest of the movie data, such as synopsis, preview url, and actors list, etc.
- It provides consistency when the movie information is updated—when a user saves their edited movie information, that information gets updated cross the app, allowing the information in the edit movie form, movie drawer, and movies homepage to change accordingly.
- It responds to users’ actions instantly by indicating to them the data loading status.

## Before We Start the Tutorial

In making of this tutorial, we assume that you have basic understanding of React and React Hooks. To gain this knowledge, we recommend following the [React tutorial](https://reactjs.org/tutorial/tutorial.html) and [this post that explains React Hooks](https://www.robinwieruch.de/react-hooks).

A few functionalities in the app were implemented with the help of third party libraries, we have included them as project dependencies in `package.json` and we’ll introduce them when they are being used, you do not need prior knowledge about them or worrying about installing them.

This tutorial is divided into 7 sections, the following list is a quick glance of each section and the main concepts they introduced. This tutorial is relatively long, intending to build the foundation of your ReSift skills. You can follow through the whole tutorial or jump to the sections pertaining to what you want to use ReSift for. Every section has their own starter code and finished code. The starter code has the needed components and styling already provided so you can focus on learning using ReSift for data fetches.

**[Setup & Overview](#setup-overview)**</br>
Provides a starting point for following the tutorial.

**[Section 1: Making Your First Fetch – Fetch Genres and Display Loading Indicator](#section-1-making-your-first-fetch-fetch-genres-and-display-loading-indicator)**</br>
Main concepts: Add ReSift to your project, Singleton data fetch, dispatch data, and indicate loading status</br>
Main ReSift APIs introduced: `createHttpService`, `createDataService`, `ResiftProvider`, `defineFetch` , `useData`, `useStatus`, `useDispatch`, `Guard`, `isLoading`

**[Section 2: Display Movies in Each Genre](#section-2-display-movies-in-each-genre)**</br>
Main concepts: Generate unique genre fetch instances via the same fetch factory</br>
Main ReSift APIs introduced: `defineFetch` , `useData`, `useStatus`, `useDispatch`, `Guard`, `isLoading`

**[Section 3: Batch Loading & Pagination](#section-3-batch-loading-pagination)**</br>
Main concepts: Fetch data in batches and merge data in the current fetch with the data from the previous fetches</br>
Main ReSift APIs introduced: `share`, `merge`, `namespace`

**[Section 4: Display Movie Info in a Movie Drawer](#section-4-display-movie-info-in-a-movie-drawer)**</br>
Main concepts: Generate unique movie fetch instances via one fetch factory by passing in http request param</br>
Main ReSift API introduced: `defineFetch`

**[Section 5: Fetch Movie Data when Hovering over Movie Thumbnail](#section-5-fetch-movie-data-when-hovering-over-movie-thumbnail)**</br>
Main concepts: Dispatch fetch when events fired</br>
Main ReSift API introduced: `useDispatch`

**[Section 6: Edit Movie](#section-6-edit-movie)**</br>
Main concepts: Creating a fetch factory to update movie info and keeping that info in sync</br>
Main ReSift API introduced: `share`

**[Section 7: Create a Mock API using the ReSift HTTP Proxy](#section-7-create-a-mock-api-using-the-resift-http-proxy)**</br>
Main concepts: Set up mock api endpoints</br>
Main ReSift API introduced: `createHttpProxy`

**If you run into any hurdle during this tutorial, please don't be hesitant to [open an issue on Github](https://github.com/justsift/resift/issues).**
**Now let's dive in!**

![dive in](https://media.giphy.com/media/1lxkgpEvs7pmlddf9D/giphy.gif)

## Setup & Overview

This project was bootstrapped with [create-react-app](https://create-react-app.dev/).

**You can follow along by forking [the codesandbox project](https://codesandbox.io/s/resift-rentals-tutorial-section1-starter-csicp) we have set up for you.**

This is what you'll see now:

![](https://paper-attachments.dropbox.com/s_E201718DD88493055F02F9925295135B6353424DF01927749BEC4071F9BBE8D3_1569864556191_initial+start.png)

Right now there’s nothing but a header. We’ll be writing in the `/src` folder during this tutorial. Let’s inspect our starter code in there:

### Folder Structure

- `src/index.js` is the entry point for our react code.
- `src/App.js` is the base file for component imports.
- `src/mockApi` holds our [mockApi](#mockapi) that provides data fetching endpoints.
- `src/components` holds our [components](#components).

### MockApi

We have created a mock API to serve as the HTTP proxy of our app, it's at `/src/mockApi`. The data this mockApi grabs was scrapped from IMDB’s first 50 pages of movies sorted by most recent. It's not necessary to understand how to set up the mockApi to continue with the tutorial. But if you’re interested, you can head over to the [last section](#section-7-create-a-mock-api-using-the-resift-http-proxy) of this tutorial where we walked through its mechanism.

To get started with the tutorial, all you need to know is that there are three endpoints with this API:

1. `/genres`: returns an array of genres in this data shape:

   ```js
   genres: Genre[];

   Genre: {
    id: string,
    name: string,
   }
   ```

2. `/genre/:id/movies`: returns an object with an array of movies and a pagination meta object in this data shape:

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

3. `/movies/:id`: returns a movie object in this data shape:

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

#### Endpoint considerations:

- The `/genre` endpoint is for displaying the names of each genre on the homepage, so we only need to return the id and name of the each genre.
- In `/genre/:id/movies` is for displaying thumbnails of the movies of each genre on the homepage. Therefore, we need to return the movie data that contains movie id, name, and poster image url. We also need the pagination meta so we can fetch movies in batches.
- In `/movies/:id`, we return the entire movie object for displaying detailed information in a movie drawer.

### Components

The finished app consists of the following presentational components:

- An `App` component as the base for component imports.
- An `AppBar` component at the top of the app viewport.
- Multiple `Genre` components, each displays the genre's name and the thumbnails of the movies in this genre.
- Multiple `MovieThumbnail` components, each displays the movie's name and horizontal poster.
- Multiple `MovieDrawer` components, each displays the detailed information of the selected movie.
- Multiple `MovieForm` components, each displays a form that allows you to edit the movie information.

![Component Sketch](assets/component_sketch.jpg)

### Styles

We use [classNames](https://github.com/JedWatson/classnames), a utility library to join JSX classes. So instead of doing `classNames={[someClassName, someOtherClassName].join(' ')`, we can just do `classNames(someClassName, someOtherClassName)`.

We use [JSS](https://cssinjs.org/?v=v10.0.0), a library that allows writing CSS code directly in JavaScript files. We also use components from [Material-UI](https://material-ui.com/), a library constructed using JSS under the hood, for react UI components, such as [Buttons](https://material-ui.com/components/buttons/).

Let’s look at some basic usage of JSS that’ll help you understand how styles are being applied in this codebase.

Take the `AppBar` component for example, adding styles with JSS looks like this:

```js
// AppBar.js
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
// {makeStyles} allows you to make a block to add css styles, it can take in `theme` as an
// argument, which would allow you to access some pre-defined material-ui styles.

const useStyles = makeStyles(theme => ({
  // The convention is to name the makeStyles block `useStyles`. In useStyles,
  // we would normally define a root class first, then define other classes afterwards.
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

Now you have all the knowledge you need to use material-ui and JSS for this project. Basically, we define styles in an object and access them using ‘useStyles’. Then we use the defined classes directly by accessing them via their key, e.g. `className={classes.root}`.

### ReSift Imports

You'd import the ReSift functions you need as modules in curly braces. For example, `import { createHttpProxy } from 'resift'` or `import { useData, useStatus, useDispatch } from 'resift'`.

That's all for setup, let's go make our first fetch!

## Section 1: Making Your First Fetch – Fetch Genres and Display Loading Indicator

When finished, our app would look like this:

![section 1 finished screen](assets/section_1_finished.gif)

When a user loads the app, we start fetching the genre data while displaying a loading spinner when the data has not been returned.

Let’s see how we can get there.

### Starter Code

You can fork the starter code from [codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section1-starter-csicp).

### 1. Installing ReSift

Note that this code has already have resift installed because it’s needed for creating the HTTP proxy.

To install ReSift from scratch, all you need to do is run: `npm install --save resift redux react-redux`, this command will install ReSift as well as ReSift’s peer dependencies: `redux` and `react-redux`, although you are not required to have knowledge on redux or react-redux in order to use ReSift.

### 2. Adding ReSift to Your Components

In order to use ReSift in your components, you need two steps:</br>
Step 1: [Add a dataService file](#add-a-dataservice-file)</br>
Step 2: [Wrap the app in `ResiftProvider`](#wrap-the-app-in-resiftprovider)

#### Add a Data Service File:

In the `/src` folder, create a js file named `dataService.js` and add in the following content:

```js
// dataService.js
import { createHttpService, createDataService } from 'resift';

const http = createHttpService({
  prefix: '/api',
});

const dataService = createDataService({
  services: { http },
  onError: e => {
    throw e;
  },
});
export default dataService;
```

This file specifies the data service that the codebase will be using. In our case, we are using http.
Now we can add in the endpoints we created in the http proxy for use in this codebase:

```js
// dataService.js
import { createHttpService, createDataService } from 'resift';
import { genres, movies, movie } from 'mockApi'; // Imports the endpoints from our mockApi

const http = createHttpService({
  prefix: '/api',
  proxies: [genres, movies, movie], // Add the mockApi endpoints as proxies
});

const dataService = createDataService({
  services: { http },
  onError: e => {
    throw e;
  },
});

export default dataService;
```

Note that if you’re using a real backend instead of an HTTP proxy, then you don’t need to add in the two lines we just added. And you might need to add token or authorization, which would be added in `getHeaders`, you can refer to [this page](../introduction/installation) for more information.

#### Wrap the App in `ResiftProvider`

**Everything** in the app that needs to use ReSift needs to be wrapped in a ReSiftProvider. Since our whole app will be using ReSift, it'll be best to add the `ResiftProvider` in our index file.
Let's go into the `index.js` file and import the ReSift modules we need:

```js
// index.js
// Import ReSift
import { ResiftProvider } from 'resift';
import dataService from './dataService';
```

And then let's wrap our App component in ReSiftProvider by replacing `<div>` with `<ResiftProvider>` and pass in our data service as the value for the prop `dataService`.

```js
// index.js
function WrappedApp() {
  return (
    <ResiftProvider dataService={dataService}>
      <MuiThemeProvider theme={theme}>...</MuiThemeProvider>
    </ResiftProvider>
  );
}
```

### 3. Making the Fetch

There are four steps to conducting a data fetch using ReSift.

Step 1: [Create a Fetch Factory](#step-1-create-a-fetch-factory-for-genres) </br>
Step 2: [Create the Fetch Instance](#step-2-create-the-fetch-instance)</br>
Step 3: [Use the Fetch](#step-3-use-the-fetch)</br>
Step 4: [Dispatch the Fetch](#step-4-dispatch-the-fetch)

You can think of this process as making an online order:

1. Creating a fetch factory is like adding what you want in a cart.
2. Creating the fetch instance is like submitting your order.
3. Using the fetch is like sending your order to the fulfillment facility, for which the fulfillment facility will respond with the goods you ordered, and send you your fulfillment status.
4. And dispatching the fetch is the fulfillment facility sending things out to you based on your order.

![GIF for fulfilling order](https://media.giphy.com/media/5JMQL3hcBcWc0/giphy.gif)

#### Step 1: Create a Fetch Factory for Genres

Let's create a `fetches` folder in the `/src` folder where we can put all our fetches in. Then add a file called `makeGetGenres.js`. It's our suggested convention to name the fetch factory ‘make + [the http method you're using] + [the thing to fetch for]’.

We call it fetch factory because it's a place to define what the fetch should look like, we'll first import the `defineFetch` module from ReSift.

```js
// /fetches/makeGetGenres.js
import { defineFetch } from 'resift';
```

And then use it to define the fetch.

```js
// /fetches/makeGetGenres.js
const makeGetGenres = defineFetch({
  displayName: 'Get Genres',
  make: () => ({
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: '/genres',
      }),
  }),
});

export default makeGetGenres;
```

To define the fetch, there are a few params.

- The first one is `displayName`, which just need to be a human readable name that helps us debug in the [redux dev tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) if you have that installed.
  ![redux dev tools](assets/section_1_redux_dev_console.png)
- The second one is a `make` function, which defines how to make the fetch. In this function, we need to:
  1. Grab the service we're using, in this case `http`, note that there’s no http import in the top level because it comes from our [dataService file](#add-a-data-service-file).
  2. Specify the method http method, in this case `GET`.
  3. Supply the endpoint for this api call, in this case `/genres` from our [mockApi](#mockapi)

#### Step 2: Create the Fetch Instance

Fetch instances are created by calling the fetch factory, therefore, to get a genres fetch instance, all we need to do is:

```js
const getGenres = makeGetGenres();
```

Wow just one line of code. We only have one kind of instance of the genresFetch because our fetch param is empty meaning that the genresFetch instance does not change based on the fetch param. And we call this a **singleton fetch**. Since it's just one line of code, we can combine it into the fetch factory file.

So let’s rename the `makeGetGenres.js` file into `getGenres.js` and then add the line in. The complete file looks like this:

```js
// /fetches/getGenres.js
import { defineFetch } from 'resift';

const makeGetGenres = defineFetch({
  displayName: 'Get Genres',
  make: () => ({
    key: [],
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: '/genres',
      }),
  }),
});
const getGenres = makeGetGenres();

export default getGenres;
```

#### Step 3: Use the Fetch

Let's use the genres fetch. We have already created the Genre component for individual genres. We'll get the genres data in the App component.
There are two modules for using the fetch: `useData` and `useStatus`. `useData` returns the data we ask for, and `useStatus` returns the status of fetching that data.

In `src/App.js`, import the module and the genres fetch we just defined:

```js
// App.js
// Import fetches
import { useData } from 'resift';
import getGenres from 'fetches/getGenres';
// Import presentational component for Genre
import Genre from 'components/Genre';
```

In the same file, inside `function App()` add:

```js
// App.js
function App() {
  const genres = useData(getGenres);

  return (
    <>
      <AppBar />
      {genres.map(genre => (
        <Genre key={genre.id} genre={genre} className={classes.genre} />
      ))}
      {/* `map` is like a for loop, loops through each genre in the genres array */}
    </>
  );
}
```

Refresh the page, you'll receive a type error: `Cannot read property 'map' of null`. It's indicating to us that `genres` is null.
So genres is the data we asked for, but it will be null when the server has not responded with the data yet.
This is where `Guard` comes in. This component makes sure that the guarded component will render if the data is returned.
`Guard` uses [render prop pattern](https://reactjs.org/docs/render-props.html), to use it, give it the prop of the `fetch` it should use.

```js
// App.js
import { Guard } from 'resift';
```

And wrap the map function in `Guard`

```js
<Guard fetch={getGenres}>
  {genres => genres.map(genre => <Genre key={genre.id} genre={genre} className={classes.genre} />)}
</Guard>
```

If you refresh the page now, we'll the error is gone, but the genres data is still not showing up on the page. Why is that?
The reason is because the genres will always be null on the first render because we have not dispatched the fetch. This is when `useDispatch` comes in.

#### Step 4: Dispatch the Fetch

Data dispatch should happen in one of the two occasions: 1) when a page first loads/when the component mounts; 2) when there's an event kicks in defined by the event handler. Our case is the former, we need the genres data when we load the page. For this we'll use React's [useEffect hook](https://reactjs.org/docs/hooks-effect.html). Let's add the imports and the effect:

```js
// App.js
...
import { useEffect } from 'react';
import { useDispatch } from 'resift'

function App() {
  ...
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getGenres());
  }, [dispatch]);
}
```

The complete code at this point looks like this:

```js
// App.js
import React, { useEffect } from 'react';
// Components
import AppBar from 'components/AppBar';
import Genre from 'components/Genre';
// Fetches
import { useData, useDispatch, Guard } from 'resift';
import getGenres from 'fetches/getGenres';
// Styles
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {},
  genre: {
    margin: '24px 0',
  },
  spinner: {
    color: 'white',
  },
}));

function App() {
  const classes = useStyles();
  const genres = useData(getGenres);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getGenres());
  }, [dispatch]);

  return (
    <div className={classes.root}>
      <AppBar />
      <Guard fetch={getGenres}>
        {genres => genres.map(genre => <Genre key={genre.id} genre={genre} />)}
      </Guard>
    </div>
  );
}

export default App;
```

Refresh the page now and you'll see the genres data load after a second. Wait, that's not a great user experience having to wait for the data to come without know what's happening. We should indicate to our user that the data is loading.

![Waiting GIF](https://media.giphy.com/media/9SIXFu7bIUYHhFc19G/giphy.gif)

#### Show Fetch Status

We want to show a loading spinner when we're fetching the data. To achieve this, we'll use the `useStatus` and a helper function to check is the status is 'loading' called `isLoading`. And we'll grab the Material UI spinner called `CircularProgress`. Let's get them imported.

```js
import { useStatus, isLoading } from 'resift';
import { CircularProgress } from '@material-ui/core';
```

Now we can add the spinner in while loading

```js
function App() {
  ...
  const status = useStatus(getGenres)

  return (
    <>
      ...
      {isLoading(status) && <CircularProgress className={classes.spinner} />}
      ...
    </>
  );
}
```

Our complete file looks like this now:

```js
// App.js
import React, { useEffect } from 'react';
// Components
import AppBar from 'components/AppBar';
import Genre from 'components/Genre';
// Fetches
import { useData, useDispatch, Guard, useStatus, isLoading } from 'resift';
import getGenres from 'fetches/getGenres';
// Styles
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {},
  genre: {
    margin: '24px 0',
  },
  spinner: {
    color: 'white',
  },
}));

function App() {
  const classes = useStyles();
  const genres = useData(getGenres);
  const dispatch = useDispatch();
  const status = useStatus(getGenres);

  useEffect(() => {
    dispatch(getGenres());
  }, [dispatch]);

  return (
    <div className={classes.root}>
      <AppBar />
      {isLoading(status) && <CircularProgress className={classes.spinner} />}
      <Guard fetch={getGenres}>
        {genres =>
          genres.map(genre => <Genre key={genre.id} genre={genre} className={classes.genre} />)
        }
      </Guard>
    </div>
  );
}

export default App;
```

Refresh the page and you shall see the loading spinner before the genres data kick in.

### Conclude

Now you’ve gone through some basic fetch concepts, let's review the online order analogy we made earlier to help form a sticky mental modal.

- _Creating a fetch factory is like adding what you want in a cart._</br>
  You're defining what your order/fetch looks like.
- _Creating the fetch instance is like submitting your order._</br>
  You've made up your mind and confirmed your order/fetch.
- _Using the fetch is like sending your order to the fulfillment facility, for which the fulfillment facility will respond with the goods you ordered, and send you your fulfillment status._</br>
  You send off your order/fetch, and then the fulfillment facility/server respond with the goods/data you requested, and notify you the status of sending over the goods/data.
- _Dispatching the fetch is the fulfillment facility sending things out to you based on your order._</br>
  The server sending out the data requested.

You can review the finished code at this point on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section1-finished-kmxjo). And let’s move on to displaying movie thumbnails in each genre.

## Section 2: Display Movies in Each Genre

Here's what we are trying to achieve in this section:
![Finished screen for this section](assets/section_2_finished.gif)

We'll see the thumbnails of the movies in each genre, and a loading spinner in each genre to indicate when our app is fetching the movies data.

### Starter Code

The starter code is the finished code from section 1, you can fork it on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section1-finished-kmxjo).

### 1. Define the Fetch Factory

Let’s first define our fetch, we’ll call it `makeGetMovies.js` and put it in the `/fetches` folder:

We'll use the `/genre/:id/movies` endpoint from our [mockApi](#mockapi).

```js
// /fetch/makeGetMovies.js
import { defineFetch } from 'resift';

const makeGetMovies = defineFetch({
  displayName: 'Get Movies',
  make: genreId => ({
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/genres/${genreId}/movies`,
      }),
  }),
});

export default makeGetMovies;
```

In section 1 we had an empty request argument because `genresFetch` is a singleton fetch. The `getMovies` will be different based on different genre ids, therefore, we need to pass `genreId` into the `make` function as the request param. This indicates that every fetch instance will be unique for every unique `genreId`.

### 2. Use the Movies Fetch

Using the movies fetch will be very similar to using the genres fetch, where we'll need the `useData`, `useStatus`,`Guard`, and `useDispatch`ReSift modules. The only difference is that this time, we need to pass in genreId as the argument for`makeGetMovies()`. Let's add the code in:

```js
// /components/Genre.js
...
import { useEffect } from 'react';
import { useData, Guard, useDispatch } from 'resift';
import makeGetMovies from 'fetches/makeGetMovies';
...
function Genre({... genre ...}) {
  ...
  const getMovies = makeGetMovies(genre.id)
  const movies = useData(getMovies)
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMovies())
  }, [dispatch, getMovies])
}
```

Now let's import the `MovieThumbnail` component and write the code that maps over the movies array and renders the `MovieThumbnail` for each item.

```js
// /components/Genre.js
...
import MovieThumbnail from 'components/MovieThumbnail';

function Genre({... genre ...}) {
  ...
  return (
    <div>
      ...
      <div className={classes.movies}>
        <Guard fetch={getMovies}>
          {movies =>
            movies.results.map(movie => (
              <MovieThumbnail
                key={movie.id}
                className={classes.movie}
                movie={movie}
              />
            ))
          }
          {/* We have to do movies.results because that's what our http proxy defines to contain the list of movies. */}
        </Guard>
      </div>
    </div>
  )
}
```

Finally, when the data is loading, we display a loading spinner.

```js
...
import { useStatus, isLoading } from 'resift';
import { CircularProgress } from '@material-ui/core';
...

function Genre() {
  ...
  const status = useStatus(getMovies)

  return (
    <div>
      ...
      {isLoading(status) && <CircularProgress className={classes.spinner} />}
      ...
    </div>
  )
```

And here's our finished code for the Genre component:

```js
// /components/Genre.js
import React, { useEffect } from 'react';
// Fetches
import { useData, useStatus, Guard, useDispatch, isLoading } from 'resift';
import makeGetMovies from 'fetches/makeGetMovies';
// Components
import MovieThumbnail from 'components/MovieThumbnail';
// Styles
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    height: 160,
    padding: 16,
    paddingTop: 4,
  },
  movies: {
    display: 'flex',
    marginTop: 24,
    overflow: 'auto',
  },
  name: {
    color: 'white',
    fontSize: 16,
  },
  movie: {
    flex: '0 0 auto',
    marginRight: 8,
    width: 240,
    height: 104,
    opacity: 0.8,
    transition: 'all 0.5s ease-out',
    '&:hover': {
      opacity: 1,
    },
  },
  loadMoreContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: 'white',
  },
  spinner: {
    color: 'white',
  },
}));

function Genre({ className, genre }) {
  const classes = useStyles();
  const { name, id } = genre;
  const getMovies = makeGetMovies(id);
  const movies = useData(getMovies);
  const status = useStatus(getMovies);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMovies());
  }, [dispatch, getMovies]);

  return (
    <div className={classNames(classes.root, className)}>
      <h2 className={classes.name}>{name}</h2>
      {isLoading(status) && <CircularProgress className={classes.spinner} />}
      <div className={classes.movies}>
        <Guard fetch={getMovies}>
          {movies =>
            movies.results.map(movie => (
              <MovieThumbnail key={movie.id} className={classes.movie} movie={movie} />
            ))
          }
          {/* We have to do movies.results because that's what our http proxy defines to contain the list of movies. */}
        </Guard>
      </div>
    </div>
  );
}

export default Genre;
```

### Conclude

1. Note that in section 1, we made one single fetch for genres where the fetch does not change based on the request param. We call it a singleton fetch. When we’re doing a singleton fetch, we’ll make the fetch instance in the same file where the fetch factory is defined.
2. When our fetch instance is different based on the request param, we need to make the fetch instance in the file where we can get the request param dynamically so we can pass it into the fetch factory. In this section, we made the fetch factory in a file called `makeGetMovies` and then made the movies fetch instance in the `Genre` component where we can get the Genre ids.

You can further examine the finished code on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section-2-sr6ks).

## Section 3: Batch Loading & Pagination

At this point of the app, we have fetched genres and the movies under each genre. When you scroll through the movies, you can see that some genres contain a lot of of them. On the initial load though, there are only certain amount of movies being displayed, therefore from a performance perspective, it's not ideal to fetch all the movies data all at once. It would be nice to fetch just enough number of movies to show the user and fetch more when needed.

Pagination and ReSift `merge` will help us achieve that.

At the end of the section we shall see:

![Finished screen of section 3](assets/section_3_finished.gif)

The app fetches 10 movies at a time and when you click the button to load more, it then fires off the fetch for the next batch of 10 movies.

### Starter Code

The starter code is the finished code from section 2, you can fork it on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section-2-sr6ks).

### 1. Query Pagination in our Movies Fetch Factory

This is what our Movies Fetch Factory currently looks like:

```js
// /fetches/makeGetMovies
import { defineFetch } from 'resift';

const makeGetMovies = defineFetch({
  displayName: 'Get Movies',
  make: genreId => ({
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/genres/${genreId}/movies`,
      }),
  }),
});

export default makeGetMovies;
```

And let's take a look at the movies endpoint in our mockApi:

```js
// /mockApi/index.js
...
export const movies = createHttpProxy(
  "/genres/:id/movies",
  async ({ requestParams, match }) => {
    await mockDelay();
    const { id } = match.params;
    const genre = genreLookup[id];

    const { query } = requestParams;
    const pageSize = _get(query, ["pageSize"]);

    if (!genre) {
      throw new Error("Genre not found");
    }

    if (!pageSize) {
      return {
        results: genre.movies
      };
    }

    const currentPageNumber = _get(query, ["page"]);
    return paginate(genre.movies, pageSize, currentPageNumber);
  }
);
...
```

We can see that this endpoint has pagination built in and will return a paginated list of movies if it receives page size (how many movies should be in one page) and current page number as arguments. Therefore, to achieve paginated fetch, we need to pass in query params (page size and current page number) into the fetch factory.

The `request` function in our `make` function is where we should add in the query params:

```js
// /fetches/makeGetMovies
...
const makeGetMovies = defineFetch({
  ...
  make: genreId => ({
    request: page => ({ http }) =>
      http({
        method: 'GET',
        route: `/genres/${genreId}/movies`,
        query: {
          page,
          pageSize: 10,
        },
      }),
  }),
});
...
```

Refresh the page now and you'll see only 10 movies are being fetched in each genre.

### 2. Trigger Re-Fetch When Clicking on the Load More Button

Now we need to trigger the next batch of fetch to happen. In section 1, we talked about two occasions when we dispatch data fetching, one when component mounts, the other one when an event triggers. This time, we would like to have the button click event to trigger the re-fetch.

We'll use the material-ui button component. And we'll add a condition that 1) if the list is loading, display loading spinner; 2) if the list is done loading and there are more items in the list, display 'more' button; 3) if the list is done loading and there are no more items in the list, display the 'end' button.

```js
// /components/Genre.js
import { Button, CircularProgress } from '@material-ui/core';

function Genre({ className, genre }) {
  ...

  const isEnd = (() => {
    if (!movies) return false;
    const { pageSize, currentPageNumber, totalNumberOfPages } = movies.paginationMeta;
    return (currentPageNumber + 1) * pageSize >= totalNumberOfPages;
  })();

  const handleLoadMore = () => {};

  return (
    ...
    <div className={classes.movies}>
      <Guard fetch={getMovies}>
        ...
      </Guard>
      <div className={classes.loadMoreContainer}>
        <Button
          onClick={handleLoadMore}
          disabled={isLoading(status) || isEnd}
        >
          {isLoading(status) ? (
            <CircularProgress className={classes.spinner} />
          ) : isEnd ? (
            "end"
          ) : (
            "more"
          )}
        </Button>
      </div>
    </div>
    ...
  )
}
```

Now you can see the 'more' button at the end of the 10 movie thumbnails. Let's make clicking on the button to load the next 10 movie thumbnails. We need two steps to get there:

1. Pass the first page, page 0, in the initial dispatch
2. Add code to our `handleLoadMore` event handler the button `onClick` to trigger re-fetch.

```js
// /components/Genre.js
function Genre({ className, genre }) {
  ...
  useEffect(() => {
    dispatch(getMovies(0)); // Pass in the first page
  }, [getMovies, dispatch]);

  const handleLoadMore = () => {
    const { currentPageNumber } = movies.paginationMeta;

    if (isEnd) return;

    dispatch(getMovies(currentPageNumber + 1));
  };
}
```

Now you shall see clicking on the 'more' button will trigger the fetch for the next 10 movies.

But, try scroll left now, you're see that every time the app fetches the next 10 movies, the current 10 movies will be replaced, and the user can't get the previously fetch movies back!

![where is my stuff gif](https://media.giphy.com/media/l4FGk9V8Re8b3gNVu/giphy.gif)

That's because the state of the fetch instance has been replaced by the new fetch. How should we solve this?

### 3. Merge Fetch States

ReSift conveniently built a `merge` function that will update instead of replacing the current state of a fetch instance with the new data. When the user clicks the 'more' button, we should dispatch a request for the next page and then merge the new results with the existing result.

Let's modify our movies fetch factory to add in the merge.

Between `displayName` and `make` block, we'll add in a block `share`. The `share` object has one required param `namespace`. Defining a namespace will allow updates that happen under one fetch instance to update the fetch state in another fetch instance that shares the same namespace.

The `share` object takes an optional object called `merge`. It's useful when the newest state needs to be merge with previous state instead of replacing it. This is exactly what we need.

```js
// /fetches/makeGetMovies.js
...
import _get from 'lodash/get'; // lodash is a library with a collection of array helpful functions

const makeGetMovies = defineFetch({
  ...
  share: {
    namespace: 'moviesOfGenre',
    merge: {
      moviesOfGenre: (previous, response) => {
        if (!previous) return response;

        return {
          results: [..._get(previous, ['results'], []), ..._get(response, ['results'], [])],
          paginationMeta: response.paginationMeta,
        };
      },
    }
  },
  ...
});

export default makeGetMovies;
```

There are different ways how two states can be merged. You can define different shapes of merging in the `merge` block. In our case, we'd like the newly fetched movies to be added on to the movie results list, while having the newest paginationMeta to take over and be the current paginationMeta state.

The updated `makeGetMovies` file now looks like this:

```js
// /fetches/makeGetMovies.js
import { defineFetch } from 'resift';
import _get from 'lodash/get';

const makeGetMovies = defineFetch({
  displayName: 'Get Movies',
  share: {
    namespace: 'moviesOfGenre',
    merge: {
      moviesOfGenre: (previous, response) => {
        if (!previous) return response;

        return {
          results: [..._get(previous, ['results'], []), ..._get(response, ['results'], [])],
          paginationMeta: response.paginationMeta,
        };
      },
    },
  },
  make: genreId => ({
    request: page => ({ http }) =>
      http({
        method: 'GET',
        route: `/genres/${genreId}/movies`,
        query: {
          page,
          pageSize: 10,
        },
      }),
  }),
});

export default makeGetMovies;
```

Inside the `merge` object, we give it a key with the name of the namespace we want to impact, in this case `moviesOfGenre`. And for the value for this key, we define how we want to merge the incoming http response with the previous http response(s).

Refresh the app now and you shall the 'more' button works as expected.

### Conclude

Instead of fetching everything at once and causing the initial load to take a long time, the ReSift `share` and `merge` apis presents a great way for batch data fetches and only fetch when needed, allowing each load to be fast. You can checkout the finished code for this section on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section-3-8fhj8).

## Section 4: Display Movie Info in a Movie Drawer

In this section, we'll be fetching individual movie data when the user clicks on the movie thumbnail. We'll then display the fetched data in a movie drawer on the right side of the screen, while displaying a loading spinner when the data is loading. When finished, we'll have something like this:

![Finished screen for section 4](assets/section_4_finished.gif)

### Starter Code

The starter code is the finished code from section 3, you can fork it on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section-3-8fhj8).

If you've following along the previous sections, you probably already guessed our first step—define our fetch factory.

### 1. Define the Fetch Factory

For this fetch, we'll use the `/movies/:id` endpoint from our [mockApi](#mockapi). Since the movie fetch will be different based on `:id` as opposed to a [singleton fetch](#step-2-create-the-fetch-instance), we'll first create a `makeGetMovie` fetch factory, then create fetch instance in the `MovieThumbnail` component.

Let's go ahead and create the `makeGetMovie.js` file in the `fetches` folder:

```js
// /fetches/makeGetMovie.js
import { defineFetch } from 'resift';

const makeGetMovie = defineFetch({
  displayName: 'Get Movie',
  make: movieId => ({
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/movies/${movieId}`,
      }),
  }),
});

export default makeGetMovie;
```

### 2. Add React Router

In order to route to the movie drawer, we are going to use the [React Router](https://reacttraining.com/react-router/web/guides/quick-start). To gain a basic understanding of react router, we recommend [this tutorial](https://www.freecodecamp.org/news/hitchhikers-guide-to-react-router-v4-a957c6a5aa18/). We’re using the latest version of react router, v 5.1.2 and this tutorial for react-router 4.0, but the basic concepts are the same.

Here are some key concepts of react router that we'll be using in this project:

- All elements using the react router needs to be wrapped in `<BrowserRouter>`.
- `<Link>` is a react router component that can take in the route and use it to compose an `<a>` element.
- The history in react-router is like a global store of the current state of the url. We'll be accessing the history object using the newly released [react router hooks](https://reacttraining.com/blog/react-router-v5-1/).

First step, in `App.js`, we need to wrap everything in `BrowserRouter`, and then import our `MovieDrawer` component:

```js
// App.js
...
import { BrowserRouter as Router} from 'react-router-dom';
import MovieDrawer from 'components/MovieDrawer';
...
function App() {
  return (
    <Router> {/* replace `<div />` with `<Router />` */}
      <AppBar />
      ...
      <MovieDrawer /> {/* add `<MovieDrawer />` inside the `<Router />` component */}
    </Router>
  );
}
export default App;
```

Note that once you add in the above code, a movie drawer will open with some movie detail about 'Coco'. We'll pass in the movie dynamically later.

Next, let's go into the `MovieThumbnail` component to add a `Link` component to directly to the the movie drawer page when the thumbnail is clicked.

```js
// /components/MovieThumbnail.js
...
import { Link } from 'react-router-dom';
...
function MovieThumbnail({ className, movie }) {
  ...
  const { id } = movie; // deconstruct id from movie
  ...

  return (
    // Just change the original <div> tag into <Link>
    // And then we can add the `to` prop to direct to individual movie drawer
    <Link
      className={classNames(classes.root, className)}
      to={`/movies/${id}`}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.9)), url(${imageUrl})`,
        backgroundSize: 'cover',
      }}
    >
      <h3 className={classes.name}>{name}</h3>
    </Link>
  );
}
```

### 3. Use Fetch in the Movie Drawer

We have created a `MovieDrawer` component, let's open it and add our fetches in. Sound familiar? That's right, in previous sections, we accomplished the fetch behaviors via a few simple steps: [create the fetch instance](#step-2-create-the-fetch-instance), [use the fetch](#step-3-use-the-fetch), [dispatch the fetch](#step-4-dispatch-the-fetch), and [indicate fetch status](#show-fetch-status).

In order to fetch the correct movie, we need the movie id, which will come from the `match` param from the `useRouteMatch` hook from React Router:

```js
// /components/MovieDrawer.js
import { useRouteMatch } from 'react-router-dom';
...
function MovieDrawer() {
  ...
  const match = useRouteMatch('/movies/:id');
  const id = match && match.params.id;
}
```

Then, we can start using the `makeGetMovie` fetch we defined earlier

```js
// /components/MovieDrawer.js
...
import { useEffect } from 'react';

// Fetches
import { useDispatch, Guard } from 'resift';
import makeGetMovie from 'fetches/makeGetMovie';
...
function Movie() {
  ...
  const open = !!match; // Let the url determine the open state of the movie drawer
  const getMovie = id && makeGetMovie(id);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (!getMovie) return; // Prevent app crashing when there's no movie id, which means getMovie fetch instance will undefined

    dispatch(getMovie());
  }, [getMovie, dispatch, status]);

  const handleEdit = () => {
    history.push(`/movies/${id}/edit`);
  };

  // Delete the coco movie data here

  return (
    // Drawer is a material-ui component we imported
    <Drawer
      anchor="right"
      open={open}
      className={classes.root}
      classes={{ paper: classes.paper }}
    >
      <div className={classes.drawer}>
        <Guard fetch={getMovie}>
          {movie => (
            <>
              {/* Wrap all the elements that needs movie data in here*/}
            </>
          )}
        </Guard>
      </div>
    </Drawer>
  )
}
```

Now you can click on a movie thumbnail and see the movie drawer open up. And let's add a few lines of code to use the react router and a button to help opening and closing the drawer.

```js
// /components/MovieDrawer.js
import { Link, useHistory} from 'react-router-dom';

function Movie() {
  ...
  const history = useHistory();

  return (
    <Drawer
      ...
      // Adding this onClose callback allows you to close the drawer when clicking away from it
      onClose={() => history.push('/')}
    >
      <div className={classes.drawer}>
        ...
        <Guard fetch={getMovie}>
          {movie => (
            <>
              <div>
                <Link className={classes.linkBack} to="/">
                  ⬅ Back
                </Link>
              </div>
              <div className={classes.movieHeader}>
              ...
              </div>
              ...
            </>
          )}
        </Guard>
      </div>
    </Drawer>
  );
}
```

Now we're still missing an data fetch status indicator...

![Loading Spinner gif](https://media.giphy.com/media/ZBQhoZC0nqknSviPqT/giphy.gif)

That's right, the loading spinner for when the movie data is loading for the movie drawer. Let's add it:

```js
// /components/MovieDrawer.js
...
import { useStatus, isLoading } from 'resift'
import { CircularProgress } from '@material-ui/core';

function Movie() {
  ...
  const status = useStatus(getMovie);
  ...
  return (
    <Drawer>
      <div className={classes.drawer}>
        {isLoading(status) && <CircularProgress className={classes.spinner} />}
        ...
      </div>
    </Drawer>
  )
}
```

Now the loading spinner shows up, but it never goes away. That's due to us dispatching the fetch when the data has already comes back. To address this, we're using a status check ReSift helper `isNormal`. You're already familiar with the `isLoading` helper. The `isNormal` helper simply checks if there requested data has been returned. Let's use it to add a simple check in our `useEffect`:

```js
// /components/MovieDrawer.js
import { isNormal } from 'resift'

function Movie() {
  ...
  useEffect(() => {
    ...
    if (isNormal(status)) return; // Don't fetch if the data is already there
    ...
  }, [...]);
}
```

### Conclude

Here's the complete code for the `MovieDrawer` component:

```js
// /components/MovieDrawer.js
import React, { useEffect } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
// Fetches
import { useDispatch, Guard, useStatus, isLoading, isNormal } from 'resift';
import makeGetMovie from 'fetches/makeGetMovie';
// Styles
import { makeStyles } from '@material-ui/core/styles';
import { Drawer, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: 20,
    position: 'relative',
  },
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    width: 600,
    padding: 16,
    height: '100vh',
  },
  paper: {
    minWidth: 600,
  },
  linkBack: {
    color: 'white',
    marginRight: 16,
  },
  buttonEdit: {
    border: 'solid 1px white',
    color: 'white',
    width: 'fit-content',
    padding: 0,
  },
  movieHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    marginTop: 16,
  },
  spinner: {
    color: 'white',
    position: 'absolute',
    left: '45%',
    top: '45%',
  },
}));

function MovieDrawer() {
  const classes = useStyles();
  const match = useRouteMatch('/movies/:id');
  const id = match && match.params.id;
  const open = !!match;
  const getMovie = id && makeGetMovie(id);
  const dispatch = useDispatch();
  const history = useHistory();
  const status = useStatus(getMovie);

  useEffect(() => {
    if (!getMovie) return; // Prevent app crashing when there's no movie id, which means getMovie fetch instance will undefined
    if (isNormal(status)) return; // Don't fetch if the data is already there

    dispatch(getMovie());
  }, [getMovie, dispatch, status]);

  return (
    // Drawer is a material-ui component we imported
    <Drawer
      anchor="right"
      open={open}
      className={classes.root}
      classes={{ paper: classes.paper }}
      onClose={() => history.push('/')}
    >
      <div className={classes.drawer}>
        {isLoading(status) && <CircularProgress className={classes.spinner} />}
        <Guard fetch={getMovie}>
          {movie => (
            <>
              <div>
                <Link className={classes.linkBack} to="/">
                  ⬅ Back
                </Link>
              </div>
              <div className={classes.movieHeader}>
                <div>
                  <h1>{movie.name}</h1>
                  <p className={classes.score}>
                    {movie.tomatoScore >= 60 ? '🍅 ' : '🤢 '}
                    {movie.tomatoScore}%
                  </p>
                  <p>
                    <span>{movie.mpaaRating}</span> | <span>{movie.runtime}</span> |{' '}
                  </p>
                  <p>{movie.genres.join(', ')}</p>
                </div>
                <img src={movie.posterUrl} alt="poster" />
              </div>
              <p>Staring: {movie.actors.join(', ')}</p>
              <p dangerouslySetInnerHTML={{ __html: movie.synopsis }} />
              <div>
                <video className={classes.preview} controls>
                  <source src={movie.trailerUrl} type="video/mp4" />
                </video>
              </div>
            </>
          )}
        </Guard>
      </div>
    </Drawer>
  );
}

export default MovieDrawer;
```

That's it! We now have a movie drawer that opens and closes.

This section showcased the usage of ReSift modules with react router, while the fetch concepts are very similar to the previous sections. ReSift is very plugable to different projects once you master the main concepts.

You can examine the finished code on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section-4-vgi28).

## Section 5: Fetch Movie Data when Hovering over Movie Thumbnail

To provide more responsive user experiences, it's nice to predict what data the user wants next and get that data ready before the user even asks for it. One of the nice-to-haves is fetching the movie data when the user hover over the thumbnail. This can be achieved by dispatching the movie fetch on hover. The associated event for it is `onMouseEnter`.

![Finished screen for section 5](assets/section_5_finished.gif)

If you click a movie thumbnail without hovering first, you'll see a loading spinner when it loads the movie data. But if you hover over a thumbnail for longer than one second and then click, you'll see the data is already loaded.

### Starter Code

The starter code is the finished code from section 4, you can fork it on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section-4-vgi28).

Try it on your own to add fetches and event handlers to the `MovieThumbnail` component.

If you get stuck, you can find our solution below for your reference.

![try it out gif](https://media.giphy.com/media/XdreKrQI1LjcQ/giphy.gif)

### Dispatch Fetch on Hover

There are two steps to make this happen:

1. Add an `onMouseEnter` event handler to the `Link` component to trigger the hover event
2. Handle this event with dispatching the movie fetch

```js
// /components/MovieThumbnail.js
...
import { useDispatch, useData } from 'resift';
import makeGetMovie from 'fetches/makeGetMovie';
...

function MovieThumbnail({ className, movie }) {
  ...
  const getMovie = makeGetMovie(id);
  const movieData = useData(getMovie);
  const dispatch = useDispatch();

  const handleMouseEnter = () => {
    // Don't fetch if the data is already there
    if (movieData) return;

    dispatch(getMovie());
  };

  return (
    <Link
      ...
      onMouseEnter={handleMouseEnter}
    >
      ...
    </Link>
  );
}
```

### Conclude

You got it! Nice little UI improvement done 😃

You can checkout the full finished code till this point on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section-5-kd1c9).

## Section 6: Edit Movie

In the web apps you've used, you might have experienced UIs where you edit information in one place and head over to a different place, only to find that information was not updated. Or as a developer, you might have experience trying different hacks just to ensure data updates are consistent cross the UI.

ReSift makes data consistency very easy to achieve. We'll demonstrate that by adding editing functionality for the movie title and synopsis. Same method can be applied to edit other fields of the movie information if you'd like to dive further.

When finished, you'll see this behavior:

![section 6 finished screen](assets/section_6_finished.gif)

After you update the movie title in the movie form, both the movie title in the movie drawer and on the homepage will get updated accordingly.

### Starter Code

The starter code is the finished code from section 5, you can fork it on [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section-5-kd1c9).

### 1. Define the Update Movie Fetch Factory

Our first step, as usual, is to define the fetch factory.

Our fetch factory for updating the movie will have a same shape as getting the movie, except we're use the `PUT` http method.

In the `/fetches` folder, let's add a file called `makeUpdateMovie.js`.

```js
// /fetches/makeUpdateMovie.js
import { defineFetch } from 'resift';

const makeUpdateMovie = defineFetch({
  displayName: 'Update Movie',
  make: movieId => ({
    // updatedMovie needs to be passed in as data to the PUT call.
    request: updatedMovie => ({ http }) =>
      http({
        method: 'PUT',
        route: `/movies/${movieId}`,
        data: updatedMovie,
      }),
  }),
});

export default makeUpdateMovie;
```

### 2. Add the Edit Movie Form

We have already build a MovieForm component. Let's import this component into `MovieDrawer` and add an edit button for pulling up the form.

```js
// /components/MovieDrawer.js
import MovieForm from 'components/MovieForm';
import { Button } from '@material-ui/core';

function MovieDrawer() {
  ...
  const handleEdit = () => {
    history.push(`/movies/${id}/edit`);
  };

  return (
    <Drawer>
      <div className={classes.drawer}>
        ...
        <Guard fetch={getMovie}>
          {movie => (
            <>
              <div>
                <Link className={classes.linkBack} to="/">
                  ⬅ Back
                </Link>
                <Button className={classes.buttonEdit} onClick={handleEdit}>
                  Edit
                </Button>
                <MovieForm movie={movie} />
              </div>
            </>
            ...
          }
          ...
        </Guard>
        ...
      </div>
    </Drawer>
  )
}
```

### 3. Edit and Update Movie via the Form

Now let's open up the `MovieForm` component and start using the update movie fetch.

1. Keep track of the draft movie (before clicking save) using React hook [useState](https://reactjs.org/docs/hooks-state.html) and add functions to update the movie title and synopsis in draftMovie state respectively.

```js
// /components/MovieForm.js
import { useState } from 'react';
...

function MovieForm({ movie }) {
  const [draftMovie, setDraftMovie] = useState(movie);
  const { id, name, synopsis } = draftMovie;

  const handleChangeName = e => {
    setDraftMovie({ ...draftMovie, name: e.target.value });
  };

  const handleChangeSynopsis = e => {
    setDraftMovie({ ...draftMovie, synopsis: e.target.value });
  };

  const handleCancel = () => {
    setDraftMovie(movie);
  };

  return (
    <Dialog>
    ...
      <form>
        <TextField
            ...
            value={name}
            onChange={handleChangeName}
          />
          <TextField
            ...
            value={synopsis}
            onChange={handleChangeSynopsis}
          />
      </form>
    </Dialog>
  )
}
```

2. Dispatch the update movie fetch when the 'save' button is clicked

```js
// /components/MovieForm.js

import { useDispatch } from 'resift';
import makeUpdateMovie from 'fetches/makeUpdateMovie';

function MovieForm({ movie }) {
  const updateMovie = makeUpdateMovie(id);
  const dispatch = useDispatch();

  const handleSave = () => {
  dispatch(updateMovie(draftMovie));
};
```

3. Use the help of React Router to determine the open state of the movie form

```js
// /components/MovieForm.js
...
import { useHistory, useRouteMatch } from 'react-router-dom';

function MovieForm({ movie }) {
  const open = !!useRouteMatch('/movies/:movieId/edit');
  const history = useHistory();

  const handleCancel = () => {
    ...
    history.push(`/movies/${id}`);
  };

  const handleSave = () => {
    ...
    history.push(`/movies/${id}`);
  };

  return <Dialog ... open={open}>...</Dialog>
}
```

Now go ahead and pick a movie to edit its title. You'll notice the 'cancel' button works just as expected, but when you hit 'save', the title in the movie drawer is not updated.

Is it because our fetch is not firing? Now pull up the edit form in the same movie drawer again by clicking on the 'edit' button. You'll see that the movie title you typed previously was successfully updated in the form.

Why is this happening? Remember in [section 3](#3-merge-fetch-states) when we're doing batch loading, we encountered an issue where the new batch would replace the existing batch as opposed to adding on to the existing batch? We solved it by using the ReSift `share` api. We need the same thing here.

![sharing gif](https://media.giphy.com/media/1AePFqtvzhZZJr2dB8/giphy.gif)

This data inconsistency is cause by the 'update movie fetch instance' and the 'movie fetch instance' (which is used by the movie drawer) not originated from the same fetch factory. Therefore, updating the state of one doesn't automatically update the state of the other.

### 4. Share States between Two Fetch Factories

You may recall we used `namespace` in [section 3](#3-merge-fetch-states). Having the same namespace indicates to ReSift that if the state in one of the fetch instance change, all the states in the fetch instances under the same namespace needs to get changed as well.

Let's add `share` and the same name for their `namespace`s in `makeGetMovie` and `makeUpdateMovie`.

```js
// /fetches/makeGetMovie.js
...
const makeGetMovie = defineFetch({
  displayName: 'Get Movie',
  share: {
    namespace: 'movie',
  },
  ...
})
```

```js
// /fetches/makeUpdateMovie.js
...
const makeUpdateMovie = defineFetch({
  displayName: 'Update Movie',
  share: {
    namespace: 'movie',
  },
  ...
})
```

Try editing the movie title or synopsis now and save, you'll see that the movie information in the movie drawer will get updated accordingly to the updates in the movie form.

That easy, just two lines added to get the job done 😉

Before we move on, there's a piece of change that we can apply to optimize user experience. Now after clicking save in the movie form, you can see the loading spinner in the drawer for a second before the update info shows up in the movie drawer. If we make our `handleEdit` function into an async function, we can wait for the update movie data to come back before closing the movie form dialog:

```js
const handleSave = async () => {
  await dispatch(updateMovie(draftMovie));
  history.push(`/movies/${id}`);
};
```

### 5. Update Shared State Cross Different Namespaces

One caveat you probably have noticed is that, if you update the movie name, the movie name in the movie thumbnail on the homepage did not get updated. Can we add the `namespace: 'movie'` to the `makeGetMovies` fetch factory also? It would have been nice, but notice that `makeGetMovies` already has a namespace defined to allow batch loading to function correctly.

Is there a way to keep shared pieces of stated updated cross different namespaces?

Yes, ReSift got your back.

We can achieve this by adding a block with the key `movie` in the `makeGetMovies` merge body to indicate to ReSift that the state of movies fetch needs to get updated if the state under the `movie` namespace get updated. And the value for this key will tell ReSift how to merge the two states.

```js
// /fetches/makeGetMovies.js
...
share: {
    namespace: "moviesOfGenre",
    merge: {
      moviesOfGenre: ...,
      movie: (previousMovies, incomingMovie) => {
        if (!previousMovies) return null;

        const index = previousMovies.results.findIndex(
          movie => movie.id === incomingMovie.id
        );

        if (index === -1) {
          return previousMovies;
        }

        return {
          ...previousMovies,
          results: [
            ...previousMovies.results.slice(0, index),
            {
              ...previousMovies.results[index],
              name: incomingMovie.name
            },
            ...previousMovies.results.slice(
              index + 1,
              previousMovies.results.length
            )
          ]
        };
      }
    }
  },
...
```

### 6. Isolate Status

With that, you can see the movie names on the homepage gets updates according to the updates in the movie form.

On side effect with that, is that every time you hover over a movie will trigger a re-fetch of the movies data in each genre. That's because in [section 5](#dispatch-fetch-on-hover), we added logic to dispatch movie fetch when hovering over the movie thumbnail.

The solution to address this is setting `isolatedStatus` to `true` in `useStatus`.

```js
// /components/Genre.js

// Find the line where it says const status = useStatus(getMovies);
// And change it to:
const status = useStatus(getMovies, { isolatedStatus: true });
```

This will ensure this status dispatch will only impact it's own fetch instance.

### Conclude

To update state across different fetch factories, your best friend is the `namespace` and `merge` block of ReSift's `share` api.

And in the situation when you need to confine the state update within the same fetch instance after you have told ReSift to `merge`, you can set the `isolatedStatus` in `useStatus` to `true`.

You can checkout the finished code update to this section on [CodeSandbox](https://codesandbox.io/s/resift-rentals-tutorial-section-6-35w4y).

Hooray! Now you have gone through all the steps and built the complete app you saw at the beginning of this tutorial. Round of applause for following along and equipping yourself with the ReSift armor!

![hooray gif](https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif)

If you're interested in learning about mocking and API, go ahead and move on to the next section. If not, you can skip section 7 and jump to [Where to Go from Here](#where-to-go-from-here).

## Section 7: Create a Mock API using the ReSift HTTP Proxy

This section is intended for people who are interested in creating a mock api, which is useful when the actual backend is not built but an agreed-upon shape of the api has been defined. You don’t have to wait till the backend is built to start testing out the fetches on the front end. You can create a mock api with ReSift’s HTTP proxy.

### Examine the Starter Files

You can fork the starter code from [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-starter-create-http-proxy-532lx).

Our goal for this mock api is to have three endpoints: `/genres`, `/genres/:id/movies`, and `/movies/:id`. You can refer to [this section](#mockapi), where we talked about the return shapes of these endpoints and our considerations.

We'll be making our http proxy in the `/src/mockApi` folder. Note that the `/mockApi` folder needs to live in the `/src` in order to work with `create-react-app`.

This folder currently contains the following files:

- An `index.js` file with helper already imported, awaiting us to build our mockApi in.
- A `movies.json` file that contains the movies data we scrapped from [Rotten Tomatoes](https://www.rottentomatoes.com).
- A `genreLookup.js` file that transforms the data in `movies.json` file into a genre lookup/dictionary that has id and certain information of each genre:

  ```js
  GenreLookup: {
    id: string,
    genre: Genre
  }
  Genre: {
    id: string,
    name: string,
    movies: Movie[] // Sorted with rotten tomato score from high to low
  }
  Movie: {
    id: string,
    name: string,
    imageUrl: string
  }
  ```

- A `movieLookup.js` file that transforms the data in `movies.json` file into a movie lookup/dictionary that has id and certain information of each movie:

  ```js
  MovieLookup: {
    id: string,
    movie: Movie
  }
  Movie: {
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

- And a pagination helper that takes in an array, a pageSize (how many array items should be on one page, and a current page number), and returns the sliced array of items on the current page, along with the paginationMeta. The return shape looks like the following:

  ```js
  {
    results: Array
    paginationMeta: {
      pageSize: number,
      currentPageNumber: number,
      totalNumberOfPages: number,
    },
  };
  ```

#### Creating the http proxy shell

The ReSift module we need for creating http proxy is `createHttpProxy`. Let's import it into the `index.js` file.

```js
// src/mockApi/index.js
import { createHttpProxy } from 'resift';
```

The shapes of the endpoints are listed [here](#mockapi). Let's keep building the http proxy shell using `createHttpProxy`.

```js
// src/mockApi/index.js
...

export const genres = createHttpProxy();

export const movies = createHttpProxy();

export const movie = createHttpProxy();
```

And let's add a mock delay to mimic network response delay.

```js
// src/mockApi/index.js
function mockDelay() {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(resolve, 1000);
    } catch (e) {
      reject(e);
    }
  });
}
```

### 1. Build the `genres` Endpoint

For the `genres` endpoint, we want the path to be `/genres`, and return an array of genres.

```js
// src/mockApi/index.js
...
import genreLookup from './genreLookup';

const genreList = Object.values(genreLookup).map(genre => ({
  id: genre.id,
  name: genre.name,
}));

export const genres = createHttpProxy(
  { path: '/genres', exact: true },
  async ({ requestParams }) => {
    await mockDelay();
    return genreList;
  },
);
```

### 2. Build the `movies` Endpoint

For the `movies` endpoint, we want the path to be `/genres/:id/movies`, and use the `paginate` helper to return a paginated movies result.

```js
// src/mockApi/index.js
...
export const movies = createHttpProxy('/genres/:id/movies', async ({ requestParams, match }) => {
  await mockDelay();
  const { id } = match.params;
  const genre = genreLookup[id];

  const { query } = requestParams;
  const pageSize = _get(query, ['pageSize']);

  if (!genre) {
    throw new Error('Genre not found');
  }

  if (!pageSize) {
    return {
      results: genre.movies,
    };
  }

  const currentPageNumber = _get(query, ['page']);
  return paginate(genre.movies, pageSize, currentPageNumber);
});
```

### 3. Build the `movie` Endpoint

For the `movie` endpoint, we want the path to be `/movies/:id`, and it has two methods, `GET` for getting the movie data, and `PUT` for updating the movie data.

```js
// src/mockApi/index.js
...
import movieLookup from './movieLookup';

export const movie = createHttpProxy('/movies/:id', async ({ requestParams, match }) => {
  await mockDelay();

  if (requestParams.method === 'PUT') {
    const { id } = match.params;
    movieLookup[id] = requestParams.data;
    return movieLookup[id];
  }

  if (requestParams.method === 'GET') {
    const { id } = match.params;
    return movieLookup[id];
  }

  throw new Error('no matching verb');
});
```

Here's the full `index.js` file for your reference:

```js
// src/mockApi/index.js
import { createHttpProxy } from 'resift';

import genreLookup from './genreLookup';
import movieLookup from './movieLookup';

// Helpers
import _get from 'lodash/get'; // array helper
import paginate from './helpers/paginate';

const genreList = Object.values(genreLookup).map(genre => ({
  id: genre.id,
  name: genre.name,
}));

function mockDelay() {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(resolve, 1000);
    } catch (e) {
      reject(e);
    }
  });
}

export const genres = createHttpProxy(
  { path: '/genres', exact: true },
  async ({ requestParams }) => {
    await mockDelay();
    return genreList;
  },
);

export const movies = createHttpProxy('/genres/:id/movies', async ({ requestParams, match }) => {
  await mockDelay();
  const { id } = match.params;
  const genre = genreLookup[id];

  const { query } = requestParams;
  const pageSize = _get(query, ['pageSize']);

  if (!genre) {
    throw new Error('Genre not found');
  }

  if (!pageSize) {
    return {
      results: genre.movies,
    };
  }

  const currentPageNumber = _get(query, ['page']);
  return paginate(genre.movies, pageSize, currentPageNumber);
});

export const movie = createHttpProxy('/movies/:id', async ({ requestParams, match }) => {
  await mockDelay();

  if (requestParams.method === 'PUT') {
    const { id } = match.params;
    movieLookup[id] = requestParams.data;
    return movieLookup[id];
  }

  if (requestParams.method === 'GET') {
    const { id } = match.params;
    return movieLookup[id];
  }

  throw new Error('no matching verb');
});
```

### Conclude

That's is for creating the mockApi for our _ReSift Rentals_ app.

You can find the complete finished code for this section on [CodeSandbox](https://codesandbox.io/s/resift-rentals-tutorial-create-http-proxy-s4jci).

You can also refer to [ReSift api docs](https://resift.org/docs/api/create-http-proxy) to further explore creating http proxy that suits your needs.

## Where to Go from Here

In this tutorial, we introduced the main concepts of ReSift you'll be using in most occasions. We intend to keep adding sections to this tutorial to introduce more ReSift api usages and provide examples. Make sure to check back in occasionally for more sections.

In the mean time, we believe that the more you practice, the more natural ReSift patterns will become for you. Checkout these [ReSift usage examples](../examples/resift-notes) to see if you can replicate them. We'll continue to add to the list.

Thanks for reading and following along! If you encounter any issues, have any questions, or want to request adding a tutorial for certain concepts, please don't hesitate to [open an issue on Github](https://github.com/justsift/resift/issues). We look forward to co-creating with you a happier data fetching experience for both developers and users.

Have fun with your ReSift journey!

![Bon Voyage](https://media.giphy.com/media/McsJRO31S6ZuHOxMqZ/giphy.gif)
