---
id: sharing-state-between-fetches
title: Sharing state between fetches
sidebar_label: Sharing state between fetches
---

By default, each fetch factory has its own state that's siloed to itself.

This means that fetch instances that come from different fetch factories will have different states even if they share the same key or endpoint.

**ReSift won't ever assume that two fetch factories have related data. However, you can tell ReSift that two fetch factories should share the same data by using the `share` API.**

> ⚠️ This is an important concept necessary to do CRUD operations correctly in ReSift.

## Shares

In order to tell ReSift that two or more fetches are related, add the `share` key to fetch factory definition in `defineFetch`:

```js
import React, { useEffect } from 'react';
import { defineFetch } from 'resift';

// get a person
const makePersonFetch = defineFetch({
  displayName: 'Get Person',

  // 👇👇👇
  share: { namespace: 'person' },
  // 👆👆👆

  make: personId => ({
    key: [personId],
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/people/${personId}`,
      }),
  }),
});

// update a person
const makeUpdatePersonFetch = defineFetch({
  displayName: 'Update Person',

  // 👇👇👇
  share: { namespace: 'person' },
  // 👆👆👆

  make: personId => ({
    key: [personId],
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

- When one fetch receives data, it will be available for any other fetch that shares the same namespace + key combo.
- When one fetch is loading, it will is will cause other fetches that share the same namespace + key to also be loading.
- When one fetch has an error, it will cause any other related fetches to have an error.

## Merges

When a fetch is shared, the default behavior of a successful data request is to _replace_ the existing data with the new data from the response.

However, sometimes it's necessary to _update_ the current state of a fetch instance with new additional data instead of replacing the current state with the new state.

This is where you can use ReSift `merge`s.

**ReSift `merge`s allow you to override the default way ReSift merges a successful response to the existing data in the cache.**

The example we'll use is infinite scrolling using a paginated endpoint: When the user scrolls to the end of the list, we should dispatch a request for the next page and then merge the new results with the existing result.

The paginated endpoint:

**`GET` `/people?page=0?pageSize=50`**

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
    "pageSize": 50,
    "total": 200
  }
}
```

We'll make our UI call this endpoint multiple times to request more data.

**`peopleFetch.js`**

This is the fetch itself. Notice how the `merge` will take the new response data and merge it back onto the previous state.

```js
import { defineFetch } from 'resift';

const makePeopleFetch = defineFetch({
  displayName: 'Get People',
  share: {
    namespace: 'people',

    // 👇👇👇
    merge: (previous, response) => {
      // in the first merge, `previous` will not be defined
      if (!previous) return response;

      return {
        // combine both lists
        people: [...previous.people, ...response.people],
        // take the most recent pagination
        pagination: response.pagination,
      };
    },
    // 👆👆👆
    //
  },
  make: () => ({
    key: [],
    request: page => ({ http }) =>
      http({
        method: 'GET',
        route: '/people',
        query: {
          page,
          pageSize: 50,
        },
        // (👆 this will add query params to the URL)
      }),
  }),
});

const peopleFetch = makePeopleFetch();
export default peopleFetch;
```

**`InfinitePeopleList.js`**

The component below shows how you can use the fetch above to create an infinite scrolling list!

```js
import React, { useEffect } from 'react';
import peopleFetch from './peopleFetch';
import InfiniteList from './InfiniteList';
import { useDispatch, useFetch, isLoading } from 'resift';

function InfinitePeopleList() {
  const dispatch = useDispatch();
  const [requestMorePeople, setRequestMorePeople] = useState(true);
  const [people, status] = useFetch(peopleFetch);

  useEffect(() => {
    if (!requestMorePeople) return;

    setRequestMorePeople(false);

    // first request, no previous pagination yet
    if (!people) {
      dispatch(peopleFetch(0));
      return;
    }

    // pull off pagination info, use it to request the next
    const { page, total, pageSize } = people.pagination;
    if (page * pageSize > total) return; // bounds check

    dispatch(peopleFetch(page + 1));
  }, [requestMorePeople, dispatch]);

  return (
    <InfiniteList
      items={people}
      // 👇 this will fire when the user hits the end of the list
      onScrollToEnd={() => setRequestMorePeople(true)}
      loading={isLoading(status)}
    />
  );
}
```

The component above uses an effect that watches for when `requestMorePeople` changes. When it changes to `true`, it grabs the current pagination information and dispatches another request for the next page.

When the next page comes in, the `merge` we defined will run and merge the previous people list with the current one. After the merge returns the next state, it will push an update to all components subscribed via `useFetch` and the new people will populate the list.

## Merges across namespaces

There are certain scenarios where you'd want _react_ to a successful response from a different fetch factory.

For example, let's say you have three fetches:

- `makeMovieItemFetch` — a fetch that grabs a single movie
- `makeUpdateMovieItemFetch` — a fetch that updates a single movie item
- `makeMovieListFetch` — a fetch that grabs all the movies

These three fetches share the same backend and the same data so ideally want to connect them in a way where if one updates, the rest of the fetches can react accordingly.

We can do this using the `merge` object syntax.

Instead of passing a single function to `merge`, we can pass in an object. The keys of this object can be any other fetch's `namespace`. The value of the key will be a merge function that determines how the state of the current namespace will react to new state from another namespace (or even the current namespace).

The examples below implement **merges across namespaces**.

`makeMovieItemFetch.js`

```js
import { defineFetch } from 'resift';

const makeMovieItemFetch = defineFetch({
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
    key: [movieId],
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/movies/${movieId}`,
      }),
  }),
});

export default makeMoveItemFetch;
```

`makeUpdateMovieItemFetch.js`

```js
import { defineFetch } from 'resift';

const makeUpdateMovieFetch = defineFetch({
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
    key: [movieId],
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

`movieListFetch.js`

```js
import { defineFetch } from 'resift';

const makeMovieListFetch = defineFetch({
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
    key: [],
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: '/movies',
      }),
  }),
});

const movieListFetch = makeMovieListFetch();
export default movieListFetch;
```

## Statues and shares
