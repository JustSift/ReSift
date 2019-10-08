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

## Section 1: Making Your First Fetch – Fetch Genres and Display Loading Indicator

When finished, it’ll look like this:

![section 1 finished screen](assets/section_1_finished.gif)

When users load the app, we'll start fetching the genre data while displaying a loading spinner when the data has not been returned.

Now let’s see how we can get there.

### Starter code

You can get the starter code via [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/starter/first-fetch) or [codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section1-starter-csicp).

Then refer to the [Setup & Overview](#setup-overview) section for spinning up the codebase and inspecting the starter code.

### 1. Installing ReSift

Note that this code has already have resift installed because it’s needed for creating the HTTP proxy.

To install ReSift from scratch, all you need to do is run: `npm install --save resift redux react-redux`, this command will install ReSift as well as ReSift’s peer dependencies: `redux` and `react-redux`, although you are not required to have knowledge on redux or react-redux in order to use ReSift.

### 2. Adding ReSift to Your Components

After installing ReSift, in order to use ReSift in your components, you need two steps:</br>
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

This file specifies the data service that the codebase will be using, in our case, we are using http.
Now we can add in the endpoints we created in the http proxy for use in this codebase:

```js
// dataService.js
import { createHttpService, createDataService } from 'resift';
import { genres, movies, movie } from 'mockApi'; // Imports the endpoints from mockApi

const http = createHttpService({
  prefix: '/api',
  proxies: [genres, movies, movie], // Add the endpoints as proxies
});

const dataService = createDataService({
  services: { http },
  onError: e => {
    throw e;
  },
});

export default dataService;
```

Note that if you’re using a real backend instead of an HTTP proxy, then you don’t need to add in the two lines we just added. And you might need to add token or authorization, those would be added in `getHeaders`, you can refer to [this page](./installation) for more information.

#### Wrap the App in `ResiftProvider`

Anything in the app that needs to use ReSift needs to be wrapped in a ReSiftProvider.
ReSift will malfunction if it's not being wrapped in the ReSiftProvider. For example, the following code has useFetch outside of the provider and it will not work:

```js
// App.js
import React from 'react';
import { ResiftProvider, useFetch } from 'resift';
import dataService from './dataService';
// Components
import AppBar from 'components/AppBar';
import Genre from 'components/Genre';
// Fetches
import genresFetch from 'fetches/genresFetch';
// DON'T DO THIS
function App() {
  const [genres] = useFetch(genresFetch);
  return (
    <ResiftProvider dataService={dataService}>
      <AppBar />
      {genres.map(genre => (
        <Genre key={genre.id} genre={genre} />
      ))}
    </ResiftProvider>
  );
}
export default App;
```

Since our whole app will be using ReSift, it'll be best to add the `ResiftProvider` in the index file instead.
Let's go into the `index.js` file and import the ReSift modules we need:

```js
// Import ReSift
import { ResiftProvider } from 'resift';
import dataService from './dataService';
```

And then wrap our App component in the ResiftProvider:

```js
function WrappedApp() {
  return (
    <ResiftProvider dataService={dataService}>
      <MuiThemeProvider theme={theme}>
        <App />
      </MuiThemeProvider>
    </ResiftProvider>
  );
}
```

Note that we have the `<App />` wrapped in the Material-UI's `<MuiThemeProvider>` to get the dark theme, so the `<ResiftProvider>` needs to wrap the `<MuiThemeProvider>` component as well.

### 3. Making the Fetch

There are four steps to conducting a data fetch using ReSift.

Step 1: [Create a Fetch Factory](#step-1-create-a-fetch-factory) </br>
Step 2: [Create the Fetch Instance](#step-2-create-the-fetch-instance)</br>
Step 3: [Use the Fetch](#step-3-use-the-fetch)</br>
Step 4: [Dispatch the Fetch](#step-4-dispatch-the-fetch)

You can think of this process as making an online order.
Creating a fetch factory is like adding what you want in a cart.
Creating the fetch instance is like submitting your order.
Using the fetch is like sending your order to the fulfillment facility, for which the fulfillment facility will respond with the goods you ordered, and send you your fulfillment status.
And dispatching the fetch is the fulfillment facility sending things out to you based on your order.

![GIF for fulfilling order](https://media.giphy.com/media/5JMQL3hcBcWc0/giphy.gif)

#### Step 1: Create a Fetch Factory

Let's create a `fetches` folder in the `/src` folder where we can put all our fetches in.
In there, let’s create the fetch factory for getting genres, in `/fetches` folder, create a file called `makeGenresFetch.js`. It's our suggested convention to name the fetch factory ‘make + [the thing to fetch for] + Fetch’.
We call it fetch factory because it's a place to define what the fetch should look like, we'll first import the `defineFetch` module from ReSift.

```js
import { defineFetch } from 'resift';
```

And then use it to define the fetch.

```js
const makeGenresFetch = defineFetch({
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
export default makeGenresFetch;
```

To define the fetch, there are a few params.

- The first one is `displayName`, which just need to be a human readable name that helps us debug in the [redux dev tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) if you have that installed.
  ![redux dev tools](assets/section_1_redux_dev_console.png)
- The second one is a `make` function, which defines how the fetch should be made. It would return a key array, and a request. We’ll talk about the key array later. For now, let’s focus on understanding the request function. In this function, we need to:
  1. Grab the service we're using, in this case `http`, note that there’s no http import in the top level because it comes from our [dataService file](#add-a-data-service-file).
  2. Specify the method http method, in this case `GET`.
  3. Supply the endpoint for this api call, in this case `/genres`

#### Step 2: Create the Fetch Instance

Fetch instances are created by calling the fetch factory, therefore, to get a genres fetch instance, all we need to do is:

```js
const genresFetch = makeGenresFetch();
```

Wow just one line of code. We only have one kind of instance of the genresFetch because our keys array is empty meaning that the genresFetch instance does not change based on keys. And we call this a singleton fetch. Since it's just one line of code, we can combine it into the fetch factory file.

So let’s rename the `makeGenresFetch.js` file into `genresFetch.js` and then add the line in.

```js
// genresFetch.js
import { defineFetch } from 'resift';
const makeGenresFetch = defineFetch({
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
const genresFetch = makeGenresFetch();
export default genresFetch;
```

#### Step 3: Use the Fetch

Let's use the genres fetch. We have already created the Genre component for individual genres. We'll get the genres data in the App component.
To use the fetch, we need the `useFetch` module from ReSift.
In `src/App.js`, import the module and the genresFetch we defined:

```js
import { useFetch } from 'resift';
import genresFetch from 'fetches/genresFetch';
```

`useFetch` will return two things, first one is the data requested, second one is the status of getting the data. In the same file, inside `function App` add:

```js
const [genres, status] = useFetch(genresFetch);
```

Now we can import the Genre component and map over the genres array, add the following code in your file:

```js
import Genre from 'components/Genre';

function App() {
  const [genres] = useFetch(genresFetch);
  return (
    <>
      <AppBar />
      {genres.map(genre => (
        <Genre key={genre.id} genre={genre} />
      ))}
    </>
  );
}
```

Refresh the page, you'll receive a type error: `Cannot read property 'map' of null`. It's indicating to us that `genres` is null.
So genres is the data we asked for, but it will be null when the server has not responded with the data yet.
This is where `status` comes in. In ReSift, we have a four data fetching statuses:

- UNKNOWN: indicating we're unsure where the data fetching process is at
- LOADING: indicating that the data fetching request has been sent, and the data is coming back
- NORMAL: indicating that the data has come back
- ERROR: indicating an error happened during the data fetching process

So we know that if the status is normal, then we're guaranteed to have gotten the data back from the server. Conveniently, ReSift has a helper function `isNormal()` that checks if that status is normal. Let's add it in and only map over genres when the status is normal.

```js
import { isNormal } from 'resift';
{
  isNormal(status) &&
    genres.map(genre => <Genre key={genre.id} genre={genre} className={classes.genre} />);
}
```

If you refresh the page now, we'll the error is gone, but the genres data is still not showing up on the page. Why is that?
The reason is if we just useFetch in the file, the genres will always be null on the first render. This is when `useDispatch` comes in.

#### Step 4: Dispatch the Fetch

Data dispatch should have in one of the two occasions: 1) when a page first loads/when component mounts; 2) when there's an event kicks in defined by the event handler. Our case is the former, we need the genres data when we load the page. For this we'll use React's [useEffect hook](https://reactjs.org/docs/hooks-effect.html). Let's add the imports and the effect:

```js
import { useEffect } from 'react';
import { useDispatch } from 'resift'

function App() {
  ...
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(genresFetch());
  }, [dispatch]);
}
```

The complete code at this point looks like this:

```js
// src/App.js
import React, { useEffect } from 'react';
// Components
import AppBar from 'components/AppBar';
import Genre from 'components/Genre';
// ReSift
import { useDispatch, useFetch, isNormal } from 'resift';
// Fetches
import genresFetch from 'fetches/genresFetch';
// Styles
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {},
  genre: {
    margin: '8px 0',
  },
}));

function App() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [genres, status] = useFetch(genresFetch);

  useEffect(() => {
    dispatch(genresFetch());
  }, [dispatch]);
  return (
    <>
      <AppBar />
      {isNormal(status) &&
        genres.map(genre => <Genre key={genre.id} genre={genre} className={classes.genre} />)}
    </>
  );
}
export default App;
```

Refresh the page now and you'll see the genres data load after a second.
Wait, that's not a great user experience having to wait for the data to come without know what's happening. We should indicate to our user that the data is loading. To achieve this, we'll use the `status` we got from `useFetch()` and a helper function from ReSift call `isLoading`. And we can display the Material UI spinner called `CircularProgress` during the loading state.
Let's import `isLoading` and `CircularProgress`:

```js
import { isLoading } from 'resift';
import { CircularProgress } from '@material-ui/core';
```

Now we can add the spinner in while loading

```js
function App() {
  ...
  return (
    <>
      ...
      {isLoading(status) && <CircularProgress />}
      ...
    </>
  );
}
```

We'll also add a piece of style in to make the spinner white.

```js
const useStyles = makeStyles(theme => ({
  ...
  spinner: {
    color: 'white',
  },
}));

function App() {
  ...
  return (
    <>
      ...
      {isLoading(status) && <CircularProgress className={classes.spinner} />}
      ...
    </>
  )
}
```

Our complete file looks like this now:

```js
import React, { useEffect } from 'react';
// Components
import AppBar from 'components/AppBar';
import Genre from 'components/Genre';
// ReSift
import { useDispatch, useFetch, isNormal, isLoading } from 'resift';
// Fetches
import genresFetch from 'fetches/genresFetch';
// Styles
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {},
  genre: {
    margin: '8px 0',
  },
  spinner: {
    color: 'white',
  },
}));

function App() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [genres, status] = useFetch(genresFetch);

  useEffect(() => {
    dispatch(genresFetch());
  }, [dispatch]);
  return (
    <>
      <AppBar />
      {isLoading(status) && <CircularProgress className={classes.spinner} />}
      {isNormal(status) &&
        genres.map(genre => <Genre key={genre.id} genre={genre} className={classes.genre} />)}
    </>
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

You can review the finished code at this point on [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/working/first-fetch-no-loader) or [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section1-finished-95182). And let’s move on to make a movie drawer which involves a movie fetch.

## Section 2: Display Movies in Each Genre

Here's what we are trying to achieve in this section:
![Finished screen for this section](assets/section_2_finished.gif)
We'll see the thumbnails of the movies in each genre, and a loading spinner in each genre to indicate when our app is fetching the movies data.

Let’s first take a look at the endpoints in `mockApi.js`, note that when we fetch all the genres, we’re only fetching the genre ids and names, we omitted fetch the movies in the genres fetch.
Now in order to display the movies in each genre, we’ll use the movies endpoint.

### 1. Define the Fetch Factory

Let’s first define our fetch, we’ll call it `makeMoviesFetch.js` and put it in the `/fetches` folder:

```js
// src/fetch/makeMoviesFetch.js
import { defineFetch } from 'resift';
const makeMoviesFetch = defineFetch({
  displayName: 'Get Movies',
  make: genreId => ({
    key: [genreId],
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/genres/${genreId}/movies`,
      }),
  }),
});
export default makeMoviesFetch;
```

In section 1 we had an empty key array because genresFetch is a singleton fetch. The moviesFetch will be different based on different genre ids, therefore, we need to put `genreId` into our key array. Adding genreId in the key array indicates that every fetch instance will be unique for every unique key.

### 2. Use the Movies Fetch

Using the movies fetch will be very similar to using the genres fetch, where we'll need the `useFetch` and `useDispatch` ReSift modules. The only difference is that this time, we need to pass in genreId as the argument for `makeMoviesFetch()`. Let's add the code in:

```js
// src/components/Genre.js
...
import { useEffect } from 'react';
import { useDispatch, useFetch } from 'resift';
import makeMoviesFetch from 'fetches/makeMoviesFetch';
...

function Genre({... genre ...}) {
  ...
  const moviesFetch = makeMoviesFetch(genre.id)
  const [movies, status] = useFetch(moviesFetch)
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(moviesFetch())
  }, [dispatch, moviesFetch])

  return (
    <div>
      ...
      {movies.results.map(...)}
      // We have to do movies.results because that's what our http proxy defines to contain the list of movies.
    </div>
  )
}
```

In the components folder, we already made a MovieThumbnail component. We can import MovieThumbnail, and when the fetch status comes back as normal, we'll map over movies to display movie thumbnails; and if the fetch status is loading, we'll display the loading spinner from material UI.

```js
...
import { isLoading, isNormal } from 'resift';
import MovieThumbnail from 'components/MovieThumbnail';
import { CircularProgress } from '@material-ui/core';
...

function Genre() {
  ...
  return (
    <div>
      ...
      {isLoading(status) && <CircularProgress />}
      {isNormal(status) && movies.map(movie => <MovieThumbnail key={movie.id} className={classes.movie} movie={movie} />)}
    </div>
  )

```

And here's our finished code for the Genre component:

```js
// /src/components/Genre.js
import React, { useEffect } from 'react';
// Fetches
import { useDispatch, useFetch, isLoading, isNormal } from 'resift';
import makeMoviesFetch from 'fetches/makeMoviesFetch';
// Components
import MovieThumbnail from 'components/MovieThumbnail';
// Styles
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: 'black',
    height: 160,
    padding: 16,
    paddingTop: 4,
  },
  movies: {
    display: 'flex',
    marginTop: 24,
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
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
  spinner: {
    color: 'white',
  },
}));

function Genre({ className, genre }) {
  const classes = useStyles();
  const { id, name } = genre;
  const moviesFetch = makeMoviesFetch(id);
  const [movies, status] = useFetch(moviesFetch);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(moviesFetch());
  }, [dispatch, moviesFetch, id]);

  return (
    <div className={classNames(classes.root, className)}>
      <h2 className={classes.name}>{name}</h2>
      <div className={classes.movies}>
        {isLoading(status) && <CircularProgress className={classes.spinner} />}
        {isNormal(status) &&
          movies.results.map(movie => (
            <MovieThumbnail key={movie.id} className={classes.movie} movie={movie} />
          ))}
      </div>
    </div>
  );
}

export default Genre;
```

### Conclude

1. Note that in section 1, we made one single fetch for genres. The fetch does not change based on fetch id. We call it a singleton fetch. When we’re doing a singleton fetch, we’ll make the fetch instance in the same file where the fetch factory is defined.
2. In this section, our fetch instance is different based on the key we passed in, and therefore we need to make the fetch instance in the file where we can get the dynamic key. So we make the fetch factory in a separate file called `makeMoviesFetch` and then we make the instance in the `Genre` component file where we can get the Genre id.

You can further examine the finished code on [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/working/movies-fetch-no-loader) or [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section2-finished-6bf1v).
