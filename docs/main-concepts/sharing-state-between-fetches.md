---
id: sharing-state-between-fetches
title: Sharing state between fetches
sidebar_label: Sharing state between fetches
---

By default, each fetch factory has its own state that is siloed to itself.

This means fetch instances that come from different fetch factories will have different states even if they share the same key or endpoint.

For example:

```js
import React, { useEffect } from 'react';
import { defineFetch, useFetch } from 'resift';

// define the fetch factories

// get a person
const makePersonFetch = defineFetch({
  displayName: 'Get Person',
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

function ExampleComponent() {
  // example usage
  const julesFetch = makePersonFetch('person-id-jules');
  const updateJulesFetch = makePersonFetch('person-id-jules');

  const [jules] = useFetch(julesFetch);
  const [shouldAlsoBeJules] = useFetch(updateJulesFetch);

  //              👇👇👇
  console.log(jules === shouldAlsoBeJules); // false !?
  //              👆👆👆

  return <div>{/* ... */}</div>;
}
```

In the example above, even though both fetches share the same ID and endpoint, the `console.log` reveals that they don't actually share the same state.

This is a problem because **inconsistent data causes inconsistent UIs**.

For example, let's say we had a form component that used `makeUpdatePersonFetch` and then we had another display component that used `makePersonFetch`. If the fetches didn't share the same state, then the display component would _not_ update when the form component updates.

Since they share the same state on the back end, it'd be ideal if we could allow these fetches to share the same state on the front end.

This doc will show you how to do so using the `share` API.

## Shares

In order to share the state between fetch factories, add `share` and then `namespace`.

`makePersonFetch.js`

```js
import { defineFetch } from 'resift';

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

export default makePersonFetch;
```

`makeUpdatePersonFetch.js`

```js
import { defineFetch } from 'resift';

const makeUpdatePersonFetch = defineFetch({
  displayName: 'Update Person',

  // 👇👇👇 make sure this namespace is the same as above
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

export default makeUpdatePersonFetch;
```

This will make it so that both fetch factories will share the same state for the same `key`s.

```js
import makePersonFetch from './makePersonFetch';
import makeUpdatePersonFetch from './makeUpdatePersonFetch';
import { useFetch } from 'resift';

function ExampleComponent() {
  // example usage
  const julesFetch = makePersonFetch('person-id-jules');
  const updateJulesFetch = makePersonFetch('person-id-jules');

  const [julesOne] = useFetch(julesFetch);
  const [shouldAlsoBeJules] = useFetch(updateJulesFetch);

  //              👇👇👇
  console.log(jules === shouldAlsoBeJules); // true ✅
  //              👆👆👆

  return <div>{/* ... */}</div>;
}
```

Now that `share` has been added with a `namespace`, these fetches will share the same data and statuses!

> **Note**: For shared fetches, ReSift will use a combination of the `namespace` and `key` to decide where to save and lookup your data. (e.g. `person` + `person-id-jules`). If the `key` is different between shared fetches, the state will also be different.

## Merges

The default behavior of a successful data request is to _replace_ the existing data with the new data from the response.

However, sometimes it's necessary to _update_ the current state of a fetch instance with new additional data instead of replacing the current state with the new state.

The example we'll use is infinite scrolling using a paginated endpoint: when the user scrolls to the end of the list, we should dispatch a request for the next page and then merge the new results with the existing result.

**`GET` `/people?page=0?pageSize=50`**

The paginated endpoint:

We'll make our UI call this endpoint multiple times to request more data.

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
      onScrollToEnd={handleScrollToEnd}
      loading={isLoading(status)}
    />
  );
}
```

The component above uses an effect that watches for when `requestMorePeople` changes. When it changes to `true`, it grabs the current pagination information and dispatches another request for the next page.

When the next page comes in, the `merge` we defined will run and merge the previous movie list with the current one. After the merge returns the next state, it will push an update to all components subscribed via `useFetch` and the new people will populate the list.

## Merges across namespaces

## Statues and shares
