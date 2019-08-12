---
id: whats-a-fetch
title: What's a fetch?
sidebar_label: What's a fetch?
---

> **A small disclaimer:** Naming collisions are an unfortunate thing we have to deal with in software engineering and ReSift's "fetches" are no different. For now, please forget what you know about fetches or [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) because they are _different_ from the fetches we define here.

## A fetch is like an order

As stated in the [quick glance](../introduction/quick-glance.md), **fetch is like an order**.

Much like an order is a noun _and_ a verb, so is our concept of fetches. However in ReSift, we always refer to fetches as _nouns_.

In ReSift, fetches are our unit/word that encapsulates everything you need to know about:

- a predefined type of request you can make,
- the status of a request (finished/normal, inflight/loading), and
- how to pull the response from memory and into your components.

## Defining a fetch

Similar to how you need to have a product listing before you place an order, you first need to have a fetch defined before you make a request.

To define a fetch, use the function `defineFetch` from ReSift.

`makePersonFetch.js`

```js
import { defineFetch } from 'resift';

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

export default makePersonFetch;
```

`defineFetch` returns a fetch factory (e.g. `makePersonFetch`).

A **fetch factory** is the definition of a type of fetch. When you call a fetch factory, you get a **fetch instance** (aka just a "fetch").

> For now, just know that `defineFetch` returns a fetch factory. We'll cover what goes into defining a fetch in [the next doc](../TODO.md).

## Making a fetch and pulling data from it

In order to make a fetch (remember, fetch is a _noun_ in this case), you need to call the fetch factory with the arguments you define in `make` of `defineFetch`.

After you make the fetch, you can then use it to pull the data and the status of the request into your component by using the hook `useFetch`.

> This examples uses [React Hooks](https://reactjs.org/docs/hooks-intro.html). We _highly_ recommend, using our Hooks API, but if you're not using React >= 16.8.x, we also offer a way to use this library with [React-Redux's `connect`](../TODO.md).

`Person.js`

```js
import React from 'react';
import PropTypes from 'prop-types';
import { useFetch, isNormal, isLoading } from 'resift';
import makePersonFetch from './makePersonFetch';
import Spinner from './Spinner';

function Person({ personId }) {
  // call the `makePersonFetch` "fetch factory" to get a "fetch" back
  const personFetch = makePersonFetch(personId);
  // these are the arguments from `make` 👆 above

  // use the fetch to get the data and status associated to your fetch
  const [data, status] = useFetch(personFetch);

  return (
    <div>
      {/* use the `isLoading` and `isNormal` helpers to show spinners or data */}
      {isLoading(status) && <Spinner />}
      {isNormal(status) && <div>Hello, {person.name}!</div>}
    </div>
  );
}

Person.propTypes = {
  personId: PropTypes.string.isRequired,
};

export default Person;
```

## Making a request then dispatching it

The last example showed you how to pull data from a fetch but not how to actually start off the request. In order to send off a request and make the fetch populate with data, you first have to make and dispatch a request.

Below is a modified example that will fetch the data when the component mounts or the `personId` changes.

```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useFetch, isNormal, isLoading } from 'resift';
import makePersonFetch from './makePersonFetch';
import Spinner from './Spinner';

function Person({ personId }) {
  // `useDispatch` to get back the `dispatch` function
  const dispatch = useDispatch();

  // Apply the `personId` to get a fetch instance.
  const personFetch = makePersonFetch(personId);

  // To get the data and status of your fetch, use `useFetch`
  const [person, status] = useFetch(personFetch);
  // (this 👆 syntax is array destructuring)

  // Use an effect to watch for fetches in `personId` and
  // re-fetch accordingly. This also covers the initial call.
  useEffect(() => {
    // make the request
    const request = personFetch();
    // dispatch
    dispatch(request);
  }, [dispatch, personFetch]);

  return (
    <div>
      {isLoading(status) && <Spinner />}
      {isNormal(status) && <div>Hello, {person.name}!</div>}
    </div>
  );
}

Person.propTypes = {
  personId: PropTypes.string.isRequired,
};

export default Person;
```

> In the example, we make the request and dispatch it separately to explain what's going on, however, it's recommended to make the request and dispatch it in the same line:
>
> ```js
> useEffect(() => {
>   dispatch(personFetch());
> }, [dispatch, personFetch]);
> ```

## The lifecycle of a fetch

1. `defineFetch` returns a **fetch factory** (e.g. `makePersonFetch`)
2. When `makePersonFetch` is called with identifiers, it returns a **fetch instance** (e.g. `personFetch`)
3. Then either:
   1. The fetch can be used to get the data and the status via **`useFetch`**.
      <br />(e.g. `const [data, status] = useFetch(personFetch)`)
   2. The fetch can be called to get a **request**. That request can be dispatched via **`dispatch`**.
      <br />(e.g. `dispatch(personFetch())`)
