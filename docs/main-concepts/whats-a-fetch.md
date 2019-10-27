---
id: whats-a-fetch
title: What's a fetch?
sidebar_label: What's a fetch?
---

> **A small disclaimer:** Naming collisions are an unfortunate thing we have to deal with in software engineering and ReSift's "fetches" are no different. For now, please forget what you know about fetches or [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) because they are _different_ from the fetches we define here.

## A fetch is noun

ReSift has this concept of a **fetch** (used as a noun). Fetches are tokens you pass to different ReSift functions to get _stuff_ about your fetch.

Here's the general workflow steps:

1. create a **fetch factory** that will produce fetch instance/tokens.
2. (within a component,) call the fetch factory to get a **fetch instance** (aka just a "fetch").
3. pass that fetch into ReSift functions to get _stuff_

```js
// call defineFetch to create a "fetch factory"
const makeGetPerson = defineFetch(/* ... */);
//         👆 this is the fetch factory

function MyComponent() {
  // call the fetch factory with some ID to get a "fetch"
  const getPerson = makeGetPerson('person-id-123');
  //         👆 this is a fetch

  // pass this fetch into ReSift functions to
  // get stuff about your fetch
  const status = useStatus(getPerson); // 👈
  const data = useData(getPerson); // 👈

  return (
    //               👇
    <Guard fetch={getPerson}>{person => <span>{person.name}</span>}</Guard>
  );
}
```

We'll go over what you can do with a fetch in the next sections. For now, the takeaway is that fetches are tokens/nouns you can give to ReSift in exchange for a status or data.

## Defining a fetch

In ReSift, you start by defining a **fetch factory**.

A fetch factory is a function that will produce fetch instances. It describes how you'll get data and how your data is related to other things in the cache ([described in an upcoming doc](./sharing-state-between-fetches.md)).

To define a fetch, use the function `defineFetch` from ReSift. Take a look at this next code example to get a sneak peak in to how to define a fetch.

> Don't get too caught up in the example just yet. In the next doc, we'll go in depth into [how to define a fetch](./how-to-define-a-fetch.md).

`makeGetPerson.js`

```js
import { defineFetch } from 'resift';

const makeGetPerson = defineFetch({
  displayName: 'Get Person',
  make: personId => ({
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/people/${personId}`,
      }),
  }),
});

export default makeGetPerson;
```

`defineFetch` returns a **fetch factory** (e.g. `makeGetPerson`).

A **fetch factory** is a producer of a type of fetch. When you call a fetch factory, you get a **fetch instance**.

```js
//                    👇 invoke this fetch factory...
const getPerson = makeGetPerson('person123');
//        👆
// ...to get a fetch instance
```

## Making a fetch and pulling data from it

In order to make a fetch instance, you need to call the fetch factory with the arguments you define in `make` of `defineFetch`.

> These arguments _must_ be strings or numbers. ReSift will use these values to decide where to save data in its internal cache.

After you make the fetch instance, you can then use it to pull the data and the status of the request into your component by using the `Guard` component and the `useStatus` hook respectively.

`Person.js`

```js
import React from 'react';
import { Guard, useStatus, isNormal, isLoading } from 'resift';
import makeGetPerson from './makeGetPerson';
import Spinner from './Spinner';

function Person({ personId }) {
  // call the `makePersonFetch` "fetch factory" to get a "fetch" back
  const getPerson = makeGetPerson(personId);
  // these are the args from `make` 👆 above

  // get the status
  const status = useStatus(getPerson);

  return (
    <div>
      {/* use the `isLoading` helper to show spinners */}
      {isLoading(status) && <Spinner />}

      {/* pass the fetch to the Guard component to get data */}
      <Guard fetch={getPerson}>
        {person => (
          // 👆 person will never be null because of the Guard
          <div>Hello, {person.name}!</div>
        )}
      </Guard>
    </div>
  );
}

export default Person;
```

The `<Guard />` component takes a function as a child. This function is called by the `<Guard />` component when the data is present and it's safe to render the contents of the Guard.

We recommend using `Guard`s in your components. However, alternatively, you can use the `useData` hook to pull the current value of the fetch. This value may be `null` if there is no data available with the associated fetch.

```js
import React from 'react';
import { useStatus, useData, isNormal, isLoading } from 'resift';
import makeGetPerson from './makeGetPerson';
import Spinner from './Spinner';

function Person({ personId }) {
  const getPerson = makeGetPerson(personId);

  const status = useStatus(getPerson);
  // ⚠️ `person` may `null` if there is no data ready
  const person = useData(getPerson);

  return (
    <div>
      {/* use the `isLoading` helper to show spinners */}
      {isLoading(status) && <Spinner />}

      {person && <div>Hello, {person.name}!</div>}
    </div>
  );
}

export default Person;
```

## Dispatching requests

The last example showed you how to pull data from a fetch instance but not how to initially dispatch the request.

Below is a modified example that will dispatch a request when the `personId` changes (including the first mount).

```js
import React, { useEffect } from 'react';
import { Guard, useDispatch, useStatus, isNormal, isLoading } from 'resift';
import makeGetPerson from './makeGetPerson';
import Spinner from './Spinner';

function Person({ personId }) {
  // `useDispatch` to get back the `dispatch` function
  const dispatch = useDispatch();

  const getPerson = makeGetPerson(personId);
  const status = useStatus(getPerson);

  // Use an effect to watch for fetches in `personId` and
  // re-fetch accordingly. This also can occur after the initial mount.
  useEffect(() => {
    dispatch(getPerson());
  }, [dispatch, getPerson()]);

  return (
    <div>
      {isLoading(status) && <Spinner />}
      <Guard fetch={getPerson}>{person => <div>Hello, {person.name}!</div>}</Guard>
    </div>
  );
}

export default Person;
```

In the example above, this component is fetching and re-fetching the person based on the `personId`.

This occurs because of the effect (via `useEffect`) that watches the dependencies array (the second argument of `useEffect`) and calls the callback when any value in the dependencies array changes. [See the official React docs for usage of the Effect Hook for more info.](https://reactjs.org/docs/hooks-effect.html)

In this case, the value `getPerson` will change when the `personId` changes. If `personId` changes, then `getPerson` will change, and that will tell the effect to re-run and send off another request.

## Fetches are global

An important thing to note is that ReSift fetches are _global_ meaning that if a fetch has been completed and used in one component, it will be ready for any another component.

This is a key concept of ReSift fetches because global fetches also means global cache/state. Global state allows the lifecycles of a fetch to be split up across many different components enabling ["fetch-then-render"](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-2-fetch-then-render-not-using-suspense) and ["render-as-you-fetch"](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) patterns.

For example, one component can be responsible for reacting to some event to pre-fetch (i.e. dispatch a request for) data for another component. These components can live anywhere in the component tree because the state of the fetches are hoisted above the component tree (i.e. they're global).

## Summary: The lifecycle of a fetch

1. `defineFetch` returns a **fetch factory** (e.g. `makeGetPerson`)
2. When `makeGetPerson` is called with a `personId`, it returns a **fetch instance** associated with that ID (e.g. `getPerson`)
3. Then either:
   1. The fetch can be used to get the data and the status via **`useStatus`** and **`<Guard />`**.
      <br />(e.g. `const status = useStatus(getPerson)`)
   2. The fetch instance can be invoked and dispatched to initiate the request.
      <br />(e.g. `dispatch(getPerson())`)
