---
id: tutorial-resift-rentals
title: Tutorial: ReSift Rentals
sidebar_label: Tutorial
---

Welcome to the ReSift tutorial!

This tutorial will introduce basic ReSift concepts through building an app called _ReSift Rentals_ that lets you browse movies, kinda like Netflix. The [completed ReSift Rentals app](https://gtcpo.csb.app/) has the following functionalities:

- It fetches genre data and presents the genre name and the thumbnails of the movies in each genre.
- It optimizes performance by only fetch the data _when needed/in batches_.
  - In the initial load, it fetches 10 movies for each genre to show their movie thumbnails. It’ll fetch the next batch of 10 movies when the user scroll past the current batch.
  - In the genre fetch, it only fetches the movie data needed for the movie thumbnails (id, name, and imageUrl). When you hover over or click the thumbnail is when it’ll fetch the rest of the movie data, such as synopsis, preview url, etc.
- It provides consistency when the movie information is updated—when a user saves the movie information they edited in the edit movie form, that information gets updated globally, allowing the information in the movie drawer to change accordingly.
- It responds to users’ actions instantly by indicating to them the data loading status.

## Before We Start the Tutorial

In making of this tutorial, we assume that you have basic understanding of React and React Hooks. To gain this knowledge, we recommend following the [React tutorial](https://reactjs.org/tutorial/tutorial.html) and [this post that explains React Hooks](https://www.robinwieruch.de/react-hooks).

We used a few third party libraries to help with certain functionalities and we’ll introduce them when they are being used, you do not need prior knowledge about them.

This tutorial is divided into 8 sections, each introduces a set of ReSift concepts. This tutorial is relatively long and you can go through all of it to build the foundation of your ReSift skills, or jump to the sections pertaining to what you want to use ReSift for. Every section has their own starter code and finished code. The starter code has the needed components and styling already provided so we can focus on introducing data fetches using ReSift.

The following list is a quick glance of each section and the main concepts they introduced. You can pick and choose the concepts you’d like to understand and start at any sections. Instead of following the tutorial, you can also look at the finished code as examples of using ReSift.

**[Setup & Overview](#setup-overview)**</br>
Gives a starting point to follow the tutorial.

**[Section 1: Making Your First Fetch – Fetch Genres and Display Loading Indicator](#section-1-making-your-first-fetch-fetch-genres-and-display-loading-indicator)**</br>
Main concepts: Singleton data fetch, dispatch data, and indicate loading status</br>
Main ReSift API introduced: `defineFetch` , `useFetch`, `useDispatch`, `isNormal`, `isLoading`, `status`

**[Section 2: Display Movies in Each Genre](#section-2-display-movies-in-each-genre)**</br>
Main concepts: Generate unique genre fetch instances via the same fetch factory</br>
Main ReSift API introduced: `key`

**[Section 3: Infinite Scrolling & Pagination](#section-3-infinite-scrolling-pagination)**</br>
Main concepts: Fetch data in batches and merge data in the current fetch with the data from the previous fetches</br>
Main ReSift API introduced: `merge`

**[Section 4: Display Movie Info in a Movie Drawer](#section-4-display-movie-info-in-a-movie-drawer)**</br>
Main concepts: Generate unique movie fetch instances via one fetch factory</br>
Main ReSift API introduced: Practice similar concepts as section 2

**[Section 5: Fetch Movie Data when Hovering over Movie Thumbnail](#section-5-fetch-movie-data-when-hovering-over-movie-thumbnail)**</br>
Main concepts: Dispatch fetch when events fired</br>
Main ReSift API introduced: `useDispatch`

**[Section 6: Edit Movie](#section-6-edit-movie)**</br>
Main concepts: Creating a fetch factory to update movie info and keeping that info in sync</br>
Main ReSift API introduced: `share`

**[Section 7: Compose Custom Hooks](#section-7-compose-custom-hooks)**</br>
Main concepts: Improve code clarity through composing custom hooks</br>
Main ReSift API introduced: How ReSift uses hooks

**[Section 8: Create a Mock API using the ReSift HTTP Proxy](#section-8-create-a-mock-api-using-the-resift-http-proxy)**</br>
Main concepts: Set up mock api endpoints</br>
Main ReSift API introduced: `createHttpProxy`

**[Where to Go from Here](#where-to-go-from-here)**</br>
Provides some additional exercises and examples of using ReSift

And at point of this tutorial you run into any hurdle, please don't be hesitant to [open an issue on Github](https://github.com/justsift/resift/issues).

Now let's dive in!

![dive in](https://media.giphy.com/media/1lxkgpEvs7pmlddf9D/giphy.gif)

## Setup & Overview

This project was bootstrapped with [create-react-app](https://create-react-app.dev/).

You can follow along in two ways:

1. Spin up your own localhost: After [cloning the repo](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/starter/first-fetch), you can cd into the project directory and do `npm install` to install all the packages and then run `npm start` to see the project running on `localhost: 3000`. Or,
2. Fork [the codesandbox project](https://codesandbox.io/s/resift-rentals-tutorial-section1-starter-csicp) we have set up for you.

This is what you'll see now:

![](https://paper-attachments.dropbox.com/s_E201718DD88493055F02F9925295135B6353424DF01927749BEC4071F9BBE8D3_1569864556191_initial+start.png)

Right now there’s nothing but a header. We’ll be writing in the `/src` folder during this tutorial. Let’s inspect our starter code in there:

### Folder Structure

- `src/index.js` is the entry point for our react code.
- `src/App.js` is the base file for component imports.
- `src/mockApi` holds our [mockApi](#mockapi) that provides data fetching endpoints.
- `src/components` holds our [components](#components).

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

#### Endpoint considerations:

- The `/genre` endpoint is for displaying the names of each genre on the homepage, so we only need to return the id and name of the each genre.
- In `/genre/:id/movies`, we do not need to return the full movie data, only need to return the movie data that contains information necessary for displaying the movie thumbnail on the homepage. We also need the pagination meta so we can fetch movies in batches.
- In `/movies/:id`, we return the entire movie object for displaying detailed information in a movie drawer.

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

That's all for setup, let's go make our first fetch!

## Section 1: Making Your First Fetch – Fetch Genres and Display Loading Indicator

When finished, it’ll look like this:

![section 1 finished screen](assets/section_1_finished.gif)

When a user loads the app, we'll start fetching the genre data while displaying a loading spinner when the data has not been returned.

Let’s see how we can get there.

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

Refresh the page now and you'll see the genres data load after a second. Wait, that's not a great user experience having to wait for the data to come without know what's happening. We should indicate to our user that the data is loading.

#### Show Fetch Status

To achieve this, we'll use the `status` we got from `useFetch()` and a helper function from ReSift call `isLoading`. And we can display the Material UI spinner called `CircularProgress` during the loading state.
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

You can review the finished code at this point on [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/working/first-fetch-no-loader) or [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section1-finished-95182). And let’s move on to displaying movie thumbnails in each genre.

## Section 2: Display Movies in Each Genre

Here's what we are trying to achieve in this section:
![Finished screen for this section](assets/section_2_finished.gif)

We'll see the thumbnails of the movies in each genre, and a loading spinner in each genre to indicate when our app is fetching the movies data.

Let’s first take a look at the endpoints in `mockApi.js`, note that when we fetch all the genres, we’re only fetching the genre ids and names, we omitted fetch the movies in the genres fetch.
Now in order to display the movies in each genre, we’ll use the movies endpoint.

You can grab the starter code from on [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/working/first-fetch-no-loader) or [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section1-finished-95182).

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

## Section 3: Infinite Scrolling & Pagination

At this point of the app, we have fetched genres and the movies under each genre. When you scroll through the movies, you can see that some genres contain a lot of of them. On the initial load though, there are only certain amount of movies being displayed, therefore from a performance perspective, it's not ideal to fetch all the movies data all at once. It would be nice to fetch just enough number of movies to show the user and fetch more when needed.

Pagination and ReSift `merge` will help us achieve that.

At the end of the section we shall see:
![Finished screen of section 3](assets/section_3_finished.gif)

It fetches 10 movies at a time and once you scroll past 10 movies, it then fires off the fetch for the next batch of 10 movies.

Let's make that happen! You can grab the starter code from [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/working/movies-fetch-no-loader) or [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section2-finished-6bf1v).

### 1. Query Pagination in our Movies Fetch Factory

This is what our Movies Fetch Factory currently looks like:

```js
// /src/fetches/makeMoviesFetch
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

And let's look at the movies endpoint in the mockApi:

```js
// src/mockApi/mockApi.js
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
...
```

We can see that this endpoint has pagination built in and will return a paginated list of movies if page size (how many movies should be in one page) and current page number are passed in. Therefore, to achieve paginated fetch, we need to add the query params (page size and current page number) into the fetch factory, and the `request` object is where we add that. Here we go:

```js
// /src/fetches/makeMoviesFetch
...
const makeMoviesFetch = defineFetch({
  ...
    request: page => ({ http }) =>
      http({
        ...
        query: {
          page,
          pageSize: 10
        }
      }),
  }),
});
...
```

Refresh the page now and you'll see only 10 movies are being fetched in each genre.

### 2. Trigger Re-Fetch on Scroll Event

Now we need to trigger the next batch of fetch to happen. In section 1, we talked about two occasions when we conduct data fetching, one when component mounts, the other one when an event triggers. In our case, we would like to have the scroll event trigger the re-fetch. To explain the concepts better, we are going to create a helper component called `InfiniteList`. Go ahead and create a `helpers` folder in the `components` folder and add a file and name it `InfiniteList.js`. And you can copy and paste in the following imports and styles to set the stage:

```js
// src/components/helpers/InfiniteList.js
import React, { useEffect, useRef, useState } from 'react';
// ReSift
import { useFetch, isLoading, useDispatch, isNormal } from 'resift';
// Styles
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {},
  spinnerContainer: {
    width: '100%',
    position: 'relative',
  },
  spinner: {
    color: 'white',
    position: 'absolute',
    top: '20%',
  },
}));

const handleScroll = () => {}

function InfiniteList({ children, className, fetch }) {
  const classes = useStyles();

  return (
    <div className={classNames(classes.root, className)} onScroll={handleScroll}>

    </div>
  );
```

The InfiniteList component will follow a [react render props](https://reactjs.org/docs/render-props.html) pattern. The `children` prop will be the children element from whichever element that's wrapped by `InfiniteList`. The `className` prop allows a parent component to define styles for the `InfiniteList`. And the `fetch` prop will be whatever fetch instance that gets passed in — for example, when we later use the `InfiniteList`, we'll be passing it the `moviesFetch`.

Now, let's first add in functions to [create the fetch instance](#step-2-create-the-fetch-instance), [use the fetch](#step-3-use-the-fetch), [dispatch the fetch](#step-4-dispatch-the-fetch), and [indicate fetch status](#show-fetch-status). You can click the respective links to review the process, and let's add to our `InfiniteList` component:

```js
function InfiniteList({ children, className, fetch }) {
  ...
  const [data, status] = useFetch(fetch);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetch)
  }, [dispatch, fetch])

  return (
    <div className={classNames(classes.root, className)} onScroll={handleScroll}>
      {isNormal(status) && children(data)}
      {isLoading(status) && <CircularProgress className={classes.spinner} />)}
    </div>
  );
```

Looks familiar so far? Both the genres fetch in section 1 and the movies fetch in section 2 followed this pattern of dispatching data on initial load, showing a loading spinner when the data is loading, and once data status is normal/data comes back, pass the data to the display components.

Next step is to trigger re-fetch when the user scroll to the end of their current page. How we calculate that is by adding an empty div at the end of each page, when that div's left bound has been scrolled past the window width, then we know the user needs to see the next page. We need to most updated state of the anchors div so we'll be utilizing the [react hook `useRef`](https://reactjs.org/docs/hooks-reference.html#useref).

Let's fill in the scroll handler:

```js
...
  // A local state of whether the user has scrolled to the end of the page
  const [hitScrollEnd, setHitScrollEnd] = useState(false);

  // A div added at the end of each page to help us check if the user has hit the end of the page
  const scrollAnchorRef = useRef(null);

  const handleScroll = () => {
    const scrollAnchor = scrollAnchorRef.current;
    if (!scrollAnchor) return; // null check

    const { left } = scrollAnchor.getBoundingClientRect();
    const { width } = document.body.getBoundingClientRect();
    setHitScrollEnd(width - left > 0);
  };

  useEffect(() => {
    // Don't need to fetch if the user hasn't scrolled to the end of the page
    if (!hitScrollEnd) return;

    if (!data) return; // null check

    const { pageSize, currentPageNumber, totalNumberOfPages } = data.paginationMeta;
    // Don't need to fetch if there's no more pages to scroll
    if (currentPageNumber * pageSize >= totalNumberOfPages) return;

    // Dispatch the fetch for the next page of data
    dispatch(fetch(currentPageNumber + 1)).then(() => {
      handleScroll();
    });
  }, [hitScrollEnd, data, dispatch, fetch]);

  return (
    <div className={classNames(classes.root, className)} onScroll={handleScroll}>
      {isNormal(status) && children(data)}
      <div ref={scrollAnchorRef} />
      {/* This ref div needs to stay after the children, otherwise it will only re-fetch once*/}
      {isLoading(status) ...}
    </div>
  );
```

Now let's use our `InfiniteList` component:

```js
// /src/components/Genre
...
import InfiniteList from 'components/helpers/InfiniteList';
...

function Genre({ className, genre }) {
  ...
  // Delete this line since the InfiniteList component handles the fetch data and status now.
  const [movies, status] = useFetch(moviesFetch);
  ...
  return (
    <div>
      ...
      <div className={classes.movies}>
        <InfiniteList className={classes.movies} fetch={moviesFetch}>
          {movies =>
            movies.results.map(movie => (
              <MovieThumbnail key={movie.id} className={classes.movie} movie={movie} />
            ))
          }
        </InfiniteList>
      </div>
    </div>
  )
}
```

Now refresh the page, you'll see that you every time you scroll right past the current page, the app will fetch the next page.

There's a bug though, try scroll left, you'll see that every time the app fetches the next page, the previous page will be gone. That's because the state of the fetch instance has been replaced by the new fetch. How should we solve this?

### 3. Merge Fetch States

ReSift conveniently built a `merge` function that will update instead of replacing the current state of a fetch instance with new additional data. When the user scrolls to the end of the movies list, we should dispatch a request for the next page and then merge the new results with the existing result.

Let's modify our movies fetch factory to add in the merge.

Between `displayName` and `make` block, we'll add in a block `share`. The `share` object has one required param `namespace`. Defining a namespace will allow that updates that happen under one fetch instance to update the fetch state in another fetch instance that shares the same namespace.

The `share` object takes an optional object called `merge`. It's useful when the newest state needs to be merge with previous state instead of replacing it. This is exactly what we need.

```js
// /src/fetches/makeMoviesFetch.js
...
const makeMoviesFetch = defineFetch({
  ...
  share: {
    namespace: 'moviesOfGenre',
    merge: (previous, response) => {
      if (!previous) return response;

      return {
        results: [..._get(previous, ['results'], []), ..._get(response, ['results'], [])],
        paginationMeta: response.paginationMeta,
      };
    },
  },
  ...
});

export default makeMoviesFetch;
```

There are different ways how two states can be merged. You can define different shapes of merging in the `merge` block. In our case, we'd like the newly fetched movies to be added on to the movie results list, while having the newest paginationMeta to take over and be the current paginationMeta state.

The whole new `makeMoviesFetch` file now looks like this:

```js
// /src/fetches/makeMoviesFetch.js
import { defineFetch } from 'resift';
import _get from 'lodash/get';

const makeMoviesFetch = defineFetch({
  displayName: 'Get Movies from Genre',
  share: {
    namespace: 'moviesOfGenre',
    merge: (previous, response) => {
      if (!previous) return response;

      return {
        results: [..._get(previous, ['results'], []), ..._get(response, ['results'], [])],
        paginationMeta: response.paginationMeta,
      };
    },
  },
  make: genreId => ({
    key: [genreId],
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

export default makeMoviesFetch;
```

Refresh the page now and you shall see the next page of movies correctly being added to the end of the current page of movies.

### 4. Handle Initial Load

Finally, there're a couple of issues to fix. First issue is that the loading spinner now showing up on the first load, that's because we did not add a initial spinner. Second issue is about edge cases where the browser window is wider than the width of 10 movies, then onScroll event will never be triggered and there will never to a re-fetch. We're going to kill two birds with one stone by adding logic for the initial fetch in the `Genre` component.

```js
...
import _range from 'lodash/range';
// _range is an array helper that turns a range into an array, e.g. _range(3) => [0, 1, 2]
...

function Genre({ className, genre }) {
  ...
  const [displayInitialSpinner, setDisplayInitialSpinner] = useState(true);

  useEffect(() => {
    // Get the width of the window
    const { width } = document.body.getBoundingClientRect();
    // 240px is the width we set for each movie thumbnail
    // 8px is the margin between movie thumbnails
    // By dividing the window width by the individual thumbnail width,
    // we can get how many thumbnails need to be loaded in the initial fetch
    const numberOfItemsToFetch = width / (240 + 8);
    // Then we divide the number of thumbnails needed by the number of thumbnails on each page,
    // we can get the number of pages we need to fetch during the initial load.
    const numberOfPagesToFetchTill = Math.ceil(numberOfItemsToFetch / 10);
    // Generate an array of pages we need to fetch
    const pages = _range(numberOfPagesToFetchTill);
    // Fetch each page one by one. We're using an async function here so we always wait for the
    // current page to finish fetching before we fetch the next page.
    (async () => {
      for (const page of pages) {
        await dispatch(moviesFetch(page));
        if (page === 0) {
          setDisplayInitialSpinner(false);
        }
      }
    })();
  }, [moviesFetch, dispatch]);

  return (
    <div className={classNames(classes.root, className)}>
      ...
      {displayInitialSpinner && (
        <div className={classes.movies}>
          <CircularProgress className={classes.spinner} />
        </div>
      )}
      ...
    </div>
  );
}
```

That's it! Now refresh the page and you can see a loading spinner on initial load, and the app will fetch until the movie thumbnail fills the whole window width during the initial load, otherwise fetch the next page of movies when the user scrolls to the end of the page.

You can checkout our finished code for this section on [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/working/pagination-no-loader) or [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section3-finished-nywki).

## Section 4: Display Movie Info in a Movie Drawer

In this section, we'll be fetching individual movie data when the user clicks on the movie thumbnail. We'll then display the fetched data in a movie drawer on the right side of the screen, while displaying a loading spinner when the data is loading. And you can navigate to open or close the drawer. When finished, we'll have something like this:

![Finished screen for section 4](assets/section_4_finished.gif)

### 1. Define the Fetch Factory

Our [mockApi](#mockapi) provides us the `movie` endpoint, which will give us the movie data of the movie of a given id. So this fetch will be using the same idea from the movies fetch in section 2, where there'll be a unique fetch instance based each movie id. Let's go ahead and create the `makeMovieFetch.js` file in the `fetches` folder:

```js
// /src/fetches/makeMovieFetch.js
import { defineFetch } from 'resift';
const makeMovieFetch = defineFetch({
  displayName: 'Get Movie',
  make: movieId => ({
    key: [movieId],
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/movies/${movieId}`,
      }),
  }),
});
export default makeMovieFetch;
```

### 2. Add React Router

For this section, we'll need some basic react router knowledge because we need to use the router change to switch between home page and single movie drawer view. To gain a basic understanding of react router, we recommend [this tutorial](https://www.freecodecamp.org/news/hitchhikers-guide-to-react-router-v4-a957c6a5aa18/). We’re using the latest version of react router, v 5.1.1 and this tutorial is react-router 4.0, but the basic concepts are universal.

First, we got to install the web version of react router, `npm install react-router-dom`.

And here're some key concepts of react router that we'll be using in this project:

- All elements using the react router needs to be wrapped in `<BrowserRouter>`.
- `<Link>` is a react router component that can take in the route and then use that to compose an `<a>` element.
- The history in react-router is like a global store of the current state of the url. We'll be accessing the history object using the newly released [react router hooks](https://reacttraining.com/blog/react-router-v5-1/).
- Finally, we'll use the `<Route>` component and the `match` param to que up the `MovieDrawer` component when the url points to it.

In `App.js`, we need to wrap everything in `BrowserRouter`, and then import our `MovieDrawer` component

```js
...
import { BrowserRouter as Router, Route} from 'react-router-dom';
import MovieDrawer from 'components/MovieDrawer';
...
function App() {
  return (
    <Router>
      <AppBar />
      {isLoading(status) && <CircularProgress className={classes.spinner} />}
      {isNormal(status) &&
        genres.map(genre => <Genre key={genre.id} genre={genre} className={classes.genre} />)}
      <Route path="/movies/:movieId" component={Movie} />
    </Router>
  );
}
export default App;
```

Next, we go into the `MovieThumbnail` component to add a `Link` component that’ll direct people to the movie drawer when they clicked the thumbnail.

```js
// src/components/MovieThumbnail
...
import { Link } from 'react-router-dom';
...
function MovieThumbnail({ className, movie }) {
  ...
  const { id, name, imageUrl } = movie;
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
export default MovieThumbnail;
```

### 3. Use Fetch in the Movie Drawer

Let's create a MovieDrawer component and paste in the react, styles, and material ui component imports.

```js
// /src/components/MovieDrawer.js
import React, from 'react';
// Styles
import { makeStyles } from '@material-ui/core/styles';
import { Drawer, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: 20,
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
  },
}));

function Movie() {
  const classes = useStyles();
}

export default Movie;
```

Next, we'll add in functions to [create the fetch instance](#step-2-create-the-fetch-instance), [use the fetch](#step-3-use-the-fetch), [dispatch the fetch](#step-4-dispatch-the-fetch), and [indicate fetch status](#show-fetch-status). You can click the respective links to review the process. In order to fetch the correct movie, we need the movie id, which will come from the `match` param from react router. Now let's add the fetch functions to our `MovieDrawer` component:

```js
// /src/components/MovieDrawer.js
...
import { useEffect } from 'react';
// Fetches
import { useDispatch, useFetch, isLoading, isNormal } from 'resift';
import makeMovieFetch from 'fetches/makeMovieFetch';
...
function Movie({ match }) {
  const classes = useStyles();
  const { movieId: id } = match.params;
  const movieFetch = makeMovieFetch(id);
  const dispatch = useDispatch();
  const [movie, status] = useFetch(movieFetch);

  useEffect(() => {
    dispatch(movieFetch());
  }, [movieFetch, dispatch]);

  return (
    // Drawer is a material-ui component we imported
    <Drawer
      anchor="right"
      open={true}
      className={classes.root}
      classes={{ paper: classes.paper }}
    >
      <div className={classes.drawer}>
        {isLoading(status) && <CircularProgress className={classes.spinner} />}
        {isNormal(status) && (
          <>
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
      </div>
    </Drawer>
  )
}
```

Now click on a movie thumbnail and you shall see the movie drawer open up. And let's add a few lines of code to use the react router to help opening and closing the drawer.

```js
// /src/components/MovieDrawer.js
import { Link, useHistory, useRouteMatch } from 'react-router-dom';

function Movie({ match }) {
  ...
  const history = useHistory();
  // Let the url determine the open state of the movie drawer
  const open = !!useRouteMatch('/movies/:movieId');

  return (
    <Drawer
      ...
      open={open}
      // Adding this onClose callback allows you to close the drawer when clicking away from it
      onClose={() => history.push('/')}
    >
      <div className={classes.drawer}>
        ...
        {isNormal(status) && (
          <>
            <div>
              {/* Adding a back button here using the react router link to direct users back to the all movies list */}
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
      </div>
    </Drawer>
  );
}
```

That's it! We now have a movie drawer that opens and closes.
You can examine the finished code on [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/working/movie-drawer-no-loader) or [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section4-finished-5cvzr).

## Section 5: Fetch Movie Data when Hovering over Movie Thumbnail

To provide more responsive user experiences, a nice-to-have is fetching the movie data when the user hover over the thumbnail. This can be achieved by dispatching the movie fetch on hover. The associated event for it is `onMouseEnter`.

Take the finished code from the last section as the starter code and try to achieve this:
![Finished screen for section 5](assets/section_5_finished.gif)

If you click a movie thumbnail without hovering first, you'll see a loading spinner when it loads the movie data. But if you hover over a thumbnail for longer than one second and then click, you'll see the data is already loaded.

Try it on your own to add fetches and event handlers to the `MovieThumbnail` component and below is our solution for your reference.

```js
// /src/components/MovieThumbnail.js
...
import { useDispatch, useFetch } from 'resift';
import makeMovieFetch from 'fetches/makeMovieFetch';
...

function MovieThumbnail({ className, movie }) {
  ...
  const movieFetch = makeMovieFetch(id);
  const [movieData] = useFetch(movieFetch);
  const dispatch = useDispatch();
  ...
  const handleMouseEnter = () => {
    // Don't fetch if the data is already there
    if (movieData) return;

    dispatch(movieFetch());
  };

  return (
    <Link
      ...
      onMouseEnter={handleMouseEnter}
    >
      <h3 className={classes.name}>{name}</h3>
    </Link>
  );
}
```

You got it!

You can checkout the full finished code till this point on [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/working/fetch-on-hover-no-loader) or [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-section5-finished-s9kf1).

## Section 6: Edit Movie

In your previous experiences, you might have experienced UIs where you edit information in one place and head over to a different place that has that information and found that it's not updated there. Or you might have the experience trying to make data updates consistent across the UI.

ReSift makes keep data updates consistent cross the app very easy. We'll demonstrate that by adding editing functionality to movie data in this section. We're going to make the movie title and movie synopsis editable as a demonstration. Same method can be applied to edit other fields of the movie information if you'd like to dive further.

When finished, you'll see something like this:
[Add a screen cast here once the movie info can be updated cross different namespaces.]

So first step again, is defining the fetch factory.

### 1. Define the Update Movie Fetch Factory

Our mockApi gives up the `movie` endpoint that accepts the `PUT` action.
In the `/fetches` folder, let's add a file called `makeUpdateMovieFetch.js`.

```js
// /src/fetches/makeUpdateMovieFetch.js
import { defineFetch } from 'resift';

const makeUpdateMovieFetch = defineFetch({
  displayName: 'Update Movie',
  make: movieId => ({
    key: [movieId],
    // updatedMovie needs to be passed in as data to the PUT call.
    request: updatedMovie => ({ http }) =>
      http({
        method: 'PUT',
        route: `/movies/${movieId}`,
        data: updatedMovie,
      }),
  }),
});
export default makeUpdateMovieFetch;
```

### 2. Add the Edit Movie Form

Now let's build the MovieForm component, for which we're going to use the material UI form and button components to build the movie form.

In your `/components` folder, add the `MovieForm.js` file:

```js
// /src/components/MovieForm.js
import React, { useState } from 'react';
// Styles
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {},
}));

function MovieForm({ movie }) {
  const classes = useStyles();
  const [draftMovie, setDraftMovie] = useState(movie);
  const { name, synopsis } = draftMovie;

  const handleChangeName = e => {
    setDraftMovie({ ...draftMovie, name: e.target.value });
  };

  const handleChangeSynopsis = e => {
    setDraftMovie({ ...draftMovie, synopsis: e.target.value });
  };

  const handleCancel = () => {
    setDraftMovie(movie);
  };

  const handleSave = () => {};

  return (
    <div className={classes.root}>
      <Dialog open={true} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Edit Movie Information</DialogTitle>
        <DialogContent>
          <form noValidate autoComplete="off">
            <TextField
              label="Name"
              value={name}
              onChange={handleChangeName}
              margin="normal"
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Synopsis"
              value={synopsis}
              onChange={handleChangeSynopsis}
              margin="normal"
              variant="outlined"
              multiline
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="outlined" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
export default MovieForm;
```

Now click on a movie thumbnail and you'll see a form for editing movies is being pulled up.

We don't want to have the form dialog open all the time though, only when the user wants to edit the form. So let's add a edit button in the movie drawer, and then use the url to determine whether or not the form dialog should be open using react router.

First, open up the `MovieDrawer` component and add

```js
// /src/components/MovieDrawer.js
import MovieForm from 'components/MovieForm';
import { Button } from '@material-ui/core';

function MovieDrawer({ match }) {
  ...
  const handleEdit = () => {
    history.push(`/movies/${id}/edit`);
  };

  return (
    <Drawer>
      <div className={classes.drawer}>
        ...
        {isNormal(status) && (
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
            ...
          </>
        }
        ...
      </div>
    </Drawer>
  )
}
```

And in the `MovieForm` component, add the logic to let the router control the open state of the form:

```js
// /src/components/MovieForm.js
import { useHistory, useRouteMatch } from 'react-router-dom';

function MovieForm({ movie }) {
  ...
  const { id } = draftMovie;
  const open = !!useRouteMatch('/movies/:movieId/edit');
  const history = useHistory();

  const handleCancel = () => {
    ...
    history.push(`/movies/${id}`);
  }

  return (
    <div ... >
      <Dialog open={open} ... >
      </Dialog>
    </div>
}
```

After changing these two files, you can see in the browser that the movie form will be pulled up once you clicked the edit button, and clicking cancel button on the form will close the form.

How about saving the edited movie? Let's use our update movie fetch factory!

### 3. Use and Dispatch the Update Movie Fetch

In the `MovieForm.js` file, let add the code for using and dispatching the update movie fetch instances.

```js
// /src/components/MovieForm.js
import makeUpdateMovieFetch from 'fetches/makeUpdateMovieFetch';
import { useDispatch } from 'resift';

function MovieForm({movie}) {
  ...
  const updateMovieFetch = makeUpdateMovieFetch(id);
  const dispatch = useDispatch();

  const handleSave = () => {
    dispatch(updateMovieFetch(draftMovie));
    history.push(`/movies/${id}`);
  };
}
```

Now try editing the movie and hit the save button. Notice that the actual content in the movie drawer did not change, but if you pulled up the edit form again, the edited movie information did get saved. Why?

This data inconsistency is cause by the update movie fetch instance and the movie fetch instance (which the movie drawer uses) not originated from the same fetch factory. Therefore, updating the state of one doesn't automatically update the state of the other, even though both share the same `movie` endpoint.

Remember we mentioned `share` and `namespace` in our [Infinite Scrolling & Pagination Section](#3-merge-fetch-states)? Have the same namespace indicates to ReSift that if the state in one of the fetch instance change, all the states in the fetch instances under the same namespace needs to get changed as well.

Let's add `share` and the same name for their `namespace`s in `makeMovieFetch` and `makeUpdateMovieFetch`.

```js
// /src/fetches/makeMovieFetch.js
...
const makeMovieFetch = defineFetch({
  displayName: 'Get Movie',
  share: {
    namespace: 'movie',
  },
  ...
})
```

```js
// /src/fetches/makeUpdateMovieFetch.js
...
const makeUpdateMovieFetch = defineFetch({
  displayName: 'Update Movie',
  share: {
    namespace: 'movie',
  },
  ...
})
```

Try editing the movie title or synopsis now and save, you'll see that the movie information in the movie drawer will get updated accordingly.

Before we move on, there's a piece of change that we can apply to optimize user experience. Now after clicking save in the movie form, you can see the loading spinner in the drawer for a second before the update info shows up in the movie drawer. If we make our `handleEdit` function into an async function, we can wait for the update movie data to come back before closing the movie form dialog:

```js
const handleSave = async () => {
  await dispatch(updateMovieFetch(draftMovie));
  history.push(`/movies/${id}`);
};
```

### 4. Update Shared State Cross Different Namespaces

One caveat you probably have noticed is that, if you update the movie name, the movie name in the movie thumbnail on the homepage did not get updated. The data in the movie thumbnails are being fetched from the `movies` endpoint. It has a namespace defined already and should not have the same namespace as the movie fetch factories because they don't share the same endpoints. Is there a way to keep shared pieces of stated updated cross different namespaces?

Yes, ReSift got your back.

[Add content to this section sharing fetches across different namespaces is added.]

You can checkout the finished code on [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/working/edit-movie).

## Section 7: Compose Custom Hooks

Since ReSift is written in hooks, it's very easy to compose custom hooks with ReSift. Custom hooks are very powerful for creating sharable state logic. You can refer to the [React Custom Hooks](https://reactjs.org/docs/hooks-custom.html) page to get familiar with the concepts.

We’ll refactor part of our code to showcase this.

[Will add a `useCurrentMovie` hook for this section.]

## Section 8: Create a Mock API using the ReSift HTTP Proxy

This section is intended for people who are interested in creating a mock backend.

This is useful when there’s not an actual backend built but an agreed-upon shape of the api. You don’t have to wait till the backend is built to start testing out the fetches on the front end. You can create a mock api with ReSift’s HTTP proxy.

### Examine the Starter Files

You can grab the starter code from [Github](https://github.com/pearlzhuzeng/resift-rentals-tutorial/tree/starter/http-proxy/) or [Codesandbox](https://codesandbox.io/s/resift-rentals-tutorial-starter-create-http-proxy-532lx).

Our goal for this mock api is to have three endpoints: `/genres`, `/genres/:id/movies`, and `/movies/:id`. You can refer to [this section](#mockapi), where we talked about the return shapes of these endpoints and our considerations.

We'll be making our http proxy in the `/src/mockApi` folder. Side note: The `/mockApi` folder needs to live in the `/src` in order to work with `create-react-app`.

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

- And a paginate helper that takes in an array, a pageSize(how many array items should be on one page, and a current page number), and returns the sliced array of items on the current page, along with the paginationMeta. The return shape looks like the following:

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

And let's add a mock delay to mimic network response delay

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

### 1. Build the `genres` endpoint

For the `genres` endpoint, we want the path to be `/genres`, and return an array of genres.

```js
// src/mockApi/index.js
...
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
...
```

### 2. Build the `movies` endpoint

For the `movies` endpoint, we want the path to be `/genres/:id/movies`, and return a paginated movies result.

```js
// src/mockApi/index.js
...
export const movies = createHttpProxy('/genres/:id/movies', async ({ requestParams, match }) => {
  await mockDelay();
  const { id } = match.params;
  const genre = genreLookup[id];

  const { query } = requestParams;
  const pageSize = _get(query, ['pageSize']);
  // `_get` is a lodash function that has null checks, so you don’t have to write out `query && query.pageSize`

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
...
```

### 3. Build the `movie` endpoint

For the `movie` endpoint, we want the path to be `/movies/:id`, and it has two methods, `GET` for getting the movie data, and `PUT` for updating the movie data.

```js
// src/mockApi/index.js
...
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
...
```

That's is for creating the mockApi for our _ReSift Rentals_ app.

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

You can also refer to [ReSift api docs](https://resift.org/docs/api/create-http-proxy) to further explore creating http proxy.

## Where to Go from Here

In this tutorial, we introduced main concepts of ReSift that you'll be using in most occasions. We intend to keep adding sections to this tutorial to introduce more ReSift api usages and provide examples. Make sure to check back in for more sections later.

In the mean time, we believe that the more you practice, the more natural ReSift patterns will be for you. Here's a list of functionalities you can continue adding to your ReSift Rentals app. We'll continue add on to the list and add suggested solutions for each practice.

- Add a `/movies` endpoint that displays all the movies in one list, instead of being listed under each genre.
  Description: abcdefghijklmn
  Hint: opqrstuvwxyz
  Suggested solution: link to working code in codesandbox
- ...
- ...

Thanks for reading and following along! If you encounter any issues or have any questions, please don't hesitate to [open an issue on Github](https://github.com/justsift/resift/issues). We look forward to co-creating with you a happier data fetching experience for both developers and users!
