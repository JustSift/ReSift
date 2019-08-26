---
id: whats-a-fetch
title: What's a fetch?
sidebar_label: What's a fetch?
---

> **A small disclaimer:** Naming collisions are an unfortunate thing we have to deal with in software engineering and ReSift's "fetches" are no different. For now, please forget what you know about fetches or [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) because they are _different_ from the fetches we define here.

## A fetch is like an order

ReSift has the concept of a **fetch**, which is loosely analogous to an **order** (on a shopping website, in a restaurant, etc).

Generally speaking, an **order** is a noun we use to describe multiple pieces of information resulting from walking through an ordering process, including:

- The product(s) to buy
- Any options or variations of the product(s) (Size, color, etc)
- A confirmation of the order (items, price)
- A order confirmation and tracking number

etc.

This analogy isn't perfect but it helps stage the idea of a fetch as defined by ReSift.

---

**Much like an order is a noun _and_ a verb, so is our concept of a fetch.**

In ReSift, fetches are our unit/word that encapsulates everything you need to know about:

- a predefined type of request you can make,
- the status of a request (finished/normal, inflight/loading), and
- how to pull the response from memory and into your components.

## Defining a fetch

Similar to how you need to have a product listing before you place an order, you first need to have a fetch defined before you make a request.

To define a fetch, use the function `defineFetch` from ReSift. Take a look at this next code example to get a sneak peak in to how to define a fetch.

> Don't get too caught up in the example just yet. In the next section, we'll go in depth into [how to define a fetch](./how-to-define-a-fetch.md).

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

`defineFetch` returns a **fetch factory** (e.g. `makePersonFetch`).

A **fetch factory** is a producer of a type of fetch. When you call a fetch factory, you get a **fetch instance**.

```js
//                    👇 invoke this fetch factory...
const personFetch = makePersonFetch('person123');
//            👆
// ...to get a fetch instance
```

## Making a fetch and pulling data from it

In order to make a fetch instance, you need to call the fetch factory with the arguments you define in `make` of `defineFetch`.

After you make the fetch instance, you can then use it to pull the data and the status of the request into your component by using the hook `useFetch`.

> This examples uses [React Hooks](https://reactjs.org/docs/hooks-intro.html). We highly recommend, using our Hooks API, but if you're not using React >= 16.8.x, we also offer a way to use this library with [React-Redux's `connect`](../TODO.md).

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
  // (this 👆 syntax is array destructuring)

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

`useFetch` is a hook that takes in a fetch instance as an argument and returns an array of length two:

1. The first item is the data associated with the fetch instance or `null` if no data is available
2. The second item is the status associated with the fetch instance. There are helpers that exist (e.g. `isNormal`, `isLoading`) that you can use to unwrap this value into their different boolean values. [Jump to Making sense of statuses to learn more.](../TODO.md)

Since `useFetch` is a hook, it has the ability to re-render your component when either the data or the status changes.

Use this hook to react to data changes and the different statuses of your fetches.

## Making a request then dispatching it

The last example showed you how to pull data from a fetch instance but not how to initially dispatch the request when the component first mounts.

Below is a modified example that will dispatch a request when the `personId` changes (including the first mount).

```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useFetch, isNormal, isLoading } from 'resift';
import makePersonFetch from './makePersonFetch';
import Spinner from './Spinner';

function Person({ personId }) {
  // `useDispatch` to get back the `dispatch` function
  const dispatch = useDispatch();

  const personFetch = makePersonFetch(personId);
  const [person, status] = useFetch(personFetch);

  // Use an effect to watch for fetches in `personId` and
  // re-fetch accordingly. This also occurs after the initial mount.
  // (e.g. `componentDidMount` too)
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

In the example above, this component is fetching and re-fetching the person based on the `personId`.

This occurs because of the effect (via `useEffect`) that watches the dependencies array (the second argument of `useEffect`) and calls the callback (the first argument) when any value in the dependencies array changes. [See the official React docs for usage of the Effect Hook for more info.](https://reactjs.org/docs/hooks-effect.html)

In this case, the value `personFetch` will change when the `personId` changes. If `personId` changes, then `personFetch` will change, and that will tell the effect to re-run and send off another request.

> **Small note:** In the example above, we made the request and dispatched it on different lines to explain what's going on, however, it's recommended to make the request and dispatch it in the same line for brevity:
>
> ```js
> useEffect(() => {
>   dispatch(personFetch());
> }, [dispatch, personFetch]);
> ```

## Summary: The lifecycle of a fetch

1. `defineFetch` returns a **fetch factory** (e.g. `makePersonFetch`)
2. When `makePersonFetch` is called with a `personId`, it returns a **fetch instance** (e.g. `personFetch`)
3. Then either:
   1. The fetch can be used to get the data and the status via **`useFetch`**.
      <br />(e.g. `const [data, status] = useFetch(personFetch)`)
   2. The fetch instance can be invoked to get a **request**. That request can be dispatched via **`dispatch`**.
      <br />(e.g. `dispatch(personFetch())`)
