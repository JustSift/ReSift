---
id: sharing-state-between-fetches
title: Sharing state between fetches
sidebar_label: Sharing state between fetches
---

By default, each fetch factory has its own state that's siloed to itself.

This means fetch instances that come from different fetch factories will have different states even if they share the same key or endpoint.

**ReSift won't ever assume that two fetch factories have related data. However, you can tell ReSift that two fetch factories should share the same data by using the `share` API.**

> ⚠️ This is an important concept necessary to do CRUD operations correctly in ReSift.

## Shares

In order to tell ReSift that two or more fetches are related, add the `share` key to fetch factory definition in `defineFetch`:

```js
import React, { useEffect } from 'react';
import { defineFetch } from 'resift';

// get a person
const makeGetPerson = defineFetch({
  displayName: 'Get Person',

  // 👇👇👇
  share: { namespace: 'person' },
  // 👆👆👆

  make: personId => ({
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/people/${personId}`,
      }),
  }),
});

// update a person
const makeUpdatePerson = defineFetch({
  displayName: 'Update Person',

  // 👇👇👇
  share: { namespace: 'person' },
  // 👆👆👆

  make: personId => ({
    request: updatedPerson => ({ http }) =>
      http({
        method: 'PUT',
        route: `/people/${personId}`,
        data: updatedPerson,
      }),
  }),
});
```

Because both fetch definitions use the same `namespace`, ReSift will ensure they both share the same data.

That means:

- When one fetch receives data, it will be available for any other fetch that shares the same namespace and ID.
- When one fetch is loading, it will is will cause other fetches that share the same namespace + key to also be loading.
- When one fetch has an error, it will cause any other related fetches to have an error.

---

Check out the demo below:

- When you edit the unshared post, it does not update immediately because ReSift does not know the get and update fetch are related. If you REFRESH the data manually, then you'll see the content update.
- When you edit the shared post, you'll see the data change immediately, without needing to manually refresh the data.

<iframe src="https://codesandbox.io/embed/shared-vs-non-shared-fetches-usk9t?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" title="Shared vs Non-Shared Fetches" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## Merges

When a fetch is shared, the default behavior of a successful data request is to _replace_ the existing data with the new data from the response.

However, sometimes it's necessary to _update_ the current state of a fetch instance with new additional data instead of replacing the current state with the new state.

This is where you can use ReSift `merge`s.

**ReSift `merge`s allow you to override the default way ReSift merges a successful response to the existing data in the cache.**

The example we'll use is infinite scrolling using a paginated endpoint: When the user scrolls to the end of the list, we should dispatch a request for the next page and then _merge_ the new results with the existing result.

The paginated endpoint:

**`GET` `/people?page=0?pageSize=10`**

```json
{
  "people": [
    {
      "id": "123",
      "name": "Tyler"
    },
    {
      "id": "456",
      "name": "Nick"
    }
    // ...
  ],
  "pagination": {
    "page": 0,
    "pageSize": 10,
    "total": 50
  }
}
```

We'll make our UI call this endpoint multiple times to request more data.

**`getPeople.js`**

This is the fetch itself. Notice how the `merge` will take the new response data and merge it back onto the previous state.

```js
import { defineFetch } from 'resift';

const makeGetPeople = defineFetch({
  displayName: 'Get People',
  share: {
    namespace: 'people',
    merge: (prevPeople, nextPeople) => {
      // during the first fetch, the data is not present so return the next
      if (!prevPeople) return nextPeople;

      // otherwise combine the data
      return {
        ...nextPeople,
        results: [...prevPeople.results, ...nextPeople.results],
      };
    },
  },
  make: () => ({
    request: page => ({ http }) =>
      http({
        method: 'GET',
        route: '/people',
        query: {
          page,
          pageSize: 10,
        },
      }),
  }),
});

const getPeople = makeGetPeople();
export default getPeople;
```

**`InfiniteList.js`**

The component below shows how you can use the fetch above to create an infinite scrolling list!

```js
import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Guard, useDispatch, useData, useStatus, isLoading } from 'resift';
import getPeople from './getPeople';
import useInterval from 'use-interval';
import { CircularProgress, List, ListItem, ListItemText } from '@material-ui/core';

function InfiniteList() {
  const dispatch = useDispatch();

  const data = useData(getPeople);
  const status = useStatus(getPeople);
  const scrollAnchorRef = useRef();
  const rootRef = useRef();

  const checkToLoadMore = () => {
    // if already loading, then early return
    if (isLoading(status)) return;

    // if there is no data, then make the first request
    if (!data) {
      dispatch(getPeople(0));
      return;
    }

    const { page, pageSize, total } = data;

    // check if there is more content to fetch, if not, early return
    if (page * pageSize >= total) return;

    // get the element instances
    const scrollAnchor = scrollAnchorRef.current;
    if (!scrollAnchor) return;
    const root = rootRef.current;
    if (!root) return;

    const { top } = scrollAnchor.getBoundingClientRect();
    const { height } = root.getBoundingClientRect();

    // early return if the scroll anchor is out of view
    if (top > height) return;

    dispatch(getPeople(page + 1));
  };

  useInterval(checkToLoadMore, 500);

  return (
    <List ref={rootRef}>
      <Guard fetch={getPeople}>
        {({ results: people }) =>
          people.map(person => (
            <ListItem key={person.id}>
              <ListItemText>{person.name}</ListItemText>
            </ListItem>
          ))
        }
      </Guard>

      <div ref={scrollAnchorRef}>{isLoading(status) && <CircularProgress size={24} />}</div>

      <Guard fetch={getPeople}>
        {({ page, pageSize, total }) => {
          if (page * pageSize < total) return null;

          return (
            <ListItem>
              <ListItemText>-- End of list --</ListItemText>
            </ListItem>
          );
        }}
      </Guard>
    </List>
  );
}

export default InfiniteList;
```

The component above uses the hook `useInterval` to poll and run the function `checkToLoadMore`. This function will run checks and then `dispatch` a fetch for the next page.

When the next page comes in, the `merge` we defined will run and merge the previous people list with the current one. After the merge returns the next state, it will push an update to all components and the new people will populate the list.

---

See the working example below:

<iframe src="https://codesandbox.io/embed/resift-infinite-scroll-df5kt?fontsize=14"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="ReSift Infinite Scroll"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## Merges across namespaces

There are certain scenarios where you'd want _react_ to a successful response from a different fetch factory.

For example, let's say you have three fetches:

- `makeGetMovieItem` — a fetch that grabs a single movie
- `makeUpdateMovieItem` — a fetch that updates a single movie item
- `getMovieListFetch` — a fetch that grabs all the movies

These three fetches share the same backend and the same data so ideally want to connect them in a way where if one updates, the rest of the fetches can react accordingly.

We can do this using the `merge` _object_ syntax.

Instead of passing a single function to `merge`, we can pass in an object. The keys of this object can be any other fetch's `namespace`. The value of the key will be a merge function that determines how the state of the current namespace will react to new state from another namespace (or even the current namespace).

The examples below implement **merges across namespaces**.

`makeGetMovieItem.js`

```js
import { defineFetch } from 'resift';

const makeGetMovieItem = defineFetch({
  displayName: 'Get Movie Item',
  share: {
    namespace: 'movieItem',
    merge: {
      // when data from the `movieList` namespace comes back, this merge
      // function will be ran.
      movieList: (prevMovieItem, nextMovieList) => {
        // in the first merge, `prevMovieItem` will not be defined.
        if (!prevMovieItem) return null;

        // replace the `prevMovieItem` with a movie in the `nextMovieList` where
        // the IDs match.
        return nextMovieList.find(movie => movie.id === prevMovieItem.id);
      },

      // when data from the `movieItem` namespaces comes back, this merge
      // function will be ran. note that this namespace is the same as the
      // current fetch factory's namespace so implementing this merge is the
      // same as doing `merge: (prevMovie, nextMovie) => nextMovie`
      movieItem: (prevMovie, nextMovie) => nextMovie,
    },
  },
  make: movieId => ({
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/movies/${movieId}`,
      }),
  }),
});

export default makeGetMovieItem;
```

`makeUpdateMovieItem.js`

```js
import { defineFetch } from 'resift';

const makeUpdateMovieItem = defineFetch({
  displayName: 'Update Movie Item',
  // note that this has the same namespace as above
  share: {
    namespace: 'movieItem',
    merge: {
      // these merges are copied and pasted from above.
      movieList: (prevMovieItem, nextMovieList) => {
        if (!prevMovieItem) return null;
        return nextMovieList.find(movie => movie.id === prevMovieItem.id);
      },
      movieItem: (prevMovie, nextMovie) => nextMovie,
    },
  },
  make: movieId => ({
    request: updatedMovie => ({ http }) =>
      http({
        method: 'PUT',
        route: `/movies/${movieId}`,
        data: updatedMovie,
      }),
  }),
});

export default makeUpdateMovieItem;
```

`getMovieList.js`

```js
import { defineFetch } from 'resift';

const makeGetMovieList = defineFetch({
  displayName: 'Get Movie List',
  // note that this has a _different_ namespace as above because this fetch is shared
  share: {
    namespace: 'movieList',
    merge: {
      movieItem: (prevMovieList, nextMovieItem) => {
        // in the first merge, `prevMovieList` will not be defined.
        if (!prevMovieList) return null;

        // if there was an update to the movie, find it in the list
        const index = prevMovieList.findIndex(movie => movie.id === nextMovieItem.id);

        // if we couldn't find it, just add it to the end
        if (index === -1) {
          return [...prevMovieList, nextMovieItem];
        }

        // replace the movie in the list with the next movie
        return [
          ...prevMovieList.slice(0, index),
          nextMovieItem,
          ...prevMovieList.slice(index + 1, prevMovieList.length),
        ];
      },
    },
  },
  make: () => ({
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: '/movies',
      }),
  }),
});

const getMovieList = makeGetMovieList();
export default getMovieList;
```

The `movieItem` and `movieList` implements merge functions that tell ReSift what to do when a response comes back from either namespace.

---

See the ReSift Notes example app from the [Quick glance](../introduction/quick-glance.md#demo-app) for a complete example of this concept.

The `makeGetNoteItem` fetch and the `getNoteList` fetch both implement ReSift object syntax shares. Notice how when a note item is updated, the note list updates as well.

<iframe src="https://codesandbox.io/embed/resift-notesj-xwp9r?fontsize=14" title="ReSift Notes" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
<br />
