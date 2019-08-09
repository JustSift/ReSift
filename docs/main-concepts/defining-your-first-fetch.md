---
id: defining-your-first-fetch
title: What's a fetch?
sidebar_label: What's a fetch?
---

## What's a fetch?

A **fetch** (not be confused with [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)) is a term we use to encompass everything regarding the state and status of a data request.

> Disclaimer: As we know, naming things is hard. And for that, we apologize if the terminology in Resift is confusing due to naming collisions.
>
> Please pay attention when we **define things** in **bold**.

To define a fetch, use the aptly named function `defineFetch` from resift.

## Defining a fetch with `defineFetch`

**`defineFetch`** is a function that returns a fetch factory.

A **fetch factory** is a function that will return a Resift **fetch** (again, not to be confused with `window.fetch`).

See the example below for the basic skelton usage of `defineFetch`:

```js
import { defineFetch } from 'resift';

// --------------------------------------------------
//
//    defineFetch returns a "fetch factory"
//                     👇
const makeMyFetch = defineFetch(/* ... */);
//      👆
//    `makeMyFetch` is the said fetch factory

// --------------------------------------------------
//
const myFetch = makeMyFetch(/* ... */);
//      👆
//    `myFetch` is the fetch
```

This fetch will then be used to dispatch and retrieve data.

```js
import { useEffect } from 'react';
import { defineFetch, useFetch, useDispatch } from 'resift';

// call `defineFetch` to get a fetch factory
const makeMyFetch = defineFetch(/* ... */);

function MyComponent() {
  // call the fetch factory to get a fetch
  const myFetch = makeMyFetch(/* ... */);

  // use the fetch to get data
  const [data, loadingState] = useFetch(myFetch);

  // dispatch the fetch to start a request
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(myFetch());
  }, [myFetch]);
}
```

The fetch usage will be discussed later in [Using your fetch](using-your-fetch.md).

But before we learn how to use fetches, we gotta learn how to make 'em 👇

## `defineFetch` parameters

`defineFetch` requires a configuration object with two required keys:

- **`displayName`** – A `string` used to give your fetch readable name in dev tools.
- **`make`** – A `function` that defines the parameters of the fetch factory. This function must return another configuration object with two keys:
  - **`key`** an array of `string`s used to store and retrieve data.
  - **`request`** a function responsible for sending a data request outbound using "fetch services" (discussed in detail in an upcoming section)

> **Note:** `defineFetch` also takes other parameters. See the API reference for more info (TODO).

## Commented example

```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineFetch, useDispatch, useFetch } from 'resift';

// 1) call `defineFetch` to get a fetch factory
const makePersonFetch = defineFetch({
  // 2) pick a display name that is human readable that will help you debug
  displayName: 'Get Person',

  // 3) define `make` — a function that must return
  //    the object: `{ key: /* ... */, fetch: /* ... */ }`
  //
  // these 👇 parameters become the parameters of `makePersonFetch`
  make: personId => ({
    // 4) define the `key` that will identify this fetch from
    //    other fetches that come from the same fetch factory
    key: [personId],

    // 5) define the `request` which is responsible for picking
    //    off a service and sending off the request
    //
    // these 👇 parameters become the parameters of the `personFetch`
    // when dispatching the fetch
    request: expand => ({ http }) =>
      // 6) the http  👆 service is being "picked off" and used
      //    to send off the request
      http({
        method: 'GET',
        route: `/people/${personId}`,
        // this will add the query param `expand` to the request
        // e.g. `/people/person123?expand=blah
        query: { expand },
      }),
  }),
});

// example `<Person />` component
function Person({ personId, expand }) {
  const dispatch = useDispatch();

  // 7) apply the `personId` to get a fetch.
  //    note: this takes in the same 👇arguments as `make` above
  const personFetch = makePersonFetch(personId);

  // 8) dispatch the fetch via an effect
  useEffect(() => {
    dispatch(personFetch(expand));
  }, [personFetch]);

  // 9) get the data and status via the `useFetch` hook
  const [person, status] = useFetch(personFetch);

  return <>{/* ... */}</>;
}

Person.propTypes = {
  personId: PropTypes.string.isRequired,
  expand: PropTypes.string,
};

export default Person;
```

## Breakdown

### 1. use `defineFetch` to create a **fetch factory**

```js
const fetchFactory = defineFetch({
  displayName: 'Get Data',
  make:
});
```

### 2. use the fetch factory in your component to get a fetch

### 3. use `useDispatch` to `dispatch` your fetch

### 4. use `useFetch` to get the data and status of your fetch
