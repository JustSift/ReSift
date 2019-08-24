---
id: sharing-state-between-fetches
title: Sharing state between fetches
sidebar_label: Sharing state between fetches
---

By default, each fetch factory has its own state that is siloed to itself.

This means that fetch instances that come from different fetch factories will have different states even if they share the same ID or endpoint.

For example:

```js
import React, { useEffect } from 'react';
import { defineFetch, useFetch, isNormal } from 'resift';

// define the fetch factories
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

const makeUpdatePersonFetch = defineFetch({
  displayName: 'Update Person',
  make: personId => ({
    key: [personId],
    request: () => ({ http }) =>
      http({
        method: 'PUT',
        route: `/people/${personId}`,
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

  return <div>{/* blah */}</div>;
}
```

Even though both fetches share the same ID and endpoint, the `console.log` reveals that they don't actually share the same state.

> This example assumes that the fetches have been dispatched and have data in them.

This is a problem when those endpoints share the same data/source of truth.

Since they share the same state on the back end, it'd be ideal if we could allow these fetches to share the same state on the front end.

This doc will show you how to do so using the `share` API.

## Shares

In order to share the state between read and write operations, add `share` and then `namespace`.

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
    request: () => ({ http }) =>
      http({
        method: 'PUT',
        route: `/people/${personId}`,
      }),
  }),
});

export default makeUpdatePersonFetch;
```

This will make it so that both fetches will share the same state.

```js
function
```
