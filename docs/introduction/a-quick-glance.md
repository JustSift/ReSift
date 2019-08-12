---
id: a-quick-glance
title: A Quick Glance
sidebar_label: A Quick Glance
---

## A fetch is like an order

ReSift has this concept of **["fetches"](../main-concepts/whats-a-fetch.md)** that are loosely analogous to **orders**.

An **order** is an everyday-noun we use to talk about the process of many things revolving around placing and receiving an order including:

- picking out a product to buy
- picking options/variations of the product
- placing an order to receive the product
- getting an order number to track the shipping progress

etc.

This analogy isn't perfect but it helps stage the idea of a fetch as defined by ReSift.

---

In ReSift, **a fetch is a noun** (similar to how an _order_ is a noun) used to talk about the process of many things revolving around data fetches.

See the commented code example to get an idea of how ReSift works.

## Commented example

The purpose of this example is to give you a quick introduction to the ideas and APIs of ReSift. It won't explain how to use everything just yet. Stay tuned!

---

### Defining a fetch

In order to start making data calls with ReSift, you first need to define your fetch.

Using the order analogy, you can think of defining a fetch like defining a product to order.

`makePersonFetch.js`

```js
import { defineFetch } from 'resift';

// `makePersonFetch` is a "fetch factory"
const makePersonFetch = defineFetch({
  displayName: 'Get Person',

  make: personId => ({
    key: [personId],

    // The `request` which is responsible for sending off the request
    request: expand => ({ http }) =>
      //       the http  👆 service is being "picked off" and used
      //       to send off the request
      http({
        method: 'GET',
        route: `/people/${personId}`,
        // this will add the query param `expand` to the request
        // e.g. `/people/person123?expand=blah
        query: { expand },
      }),
  }),
});

export default makePersonFetch;
```

---

### Using and dispatching a fetch

When you define a fetch, you create a **fetch factory**.

You call the fetch factory to get a **fetch instance** (which we usually just refer to as a "fetch").

> This example makes use of [React Hooks](https://reactjs.org/docs/hooks-intro.html). If you're not familiar with React Hooks, these examples may look a bit foreign as they are hooks idiomatic.
>
> We recommend using our hooks API but if you're not comfortable, we do offer a [render prop API]() for more compatibility. [(what are render props?)](https://reactjs.org/docs/render-props.html)

`Person.js`

```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useFetch, isNormal } from 'resift';
import makePersonFetch from './makePersonFetch';
import Spinner from './Spinner';

function Person({ personId, expand }) {
  const dispatch = useDispatch();

  // Apply the `personId` to get a fetch instance.
  const personFetch = makePersonFetch(personId);

  // To get the data and status of your fetch, use `useFetch`
  const [person, status] = useFetch(personFetch);

  // Use an effect to watch for fetches in `personId` and
  // re-fetch accordingly. This also covers the initial call.
  useEffect(() => {
    const request = personFetch(expand);
    dispatch(request);
  }, [dispatch, personFetch, expand]);

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
  expand: PropTypes.string,
};

export default Person;
```

Intrigued? Continue to the [Main Concepts]() to learn more.
