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
- etc.

This analogy isn't perfect but it helps put in your mind the ideas of a fetch as defined by ReSift.

---

**In ReSift, a fetch is a noun** (similar to how an _order_ is a noun) used to talk about the process of many things revolving around data fetches.

See the commented code example to get an idea of how ReSift works.

## Commented Example

> This example makes use of [React Hooks](https://reactjs.org/docs/hooks-intro.html). If you're not familiar with React Hooks, these examples may look a bit magical.
>
> We recommend using the hooks API but if you're not comfortable, we do offer a [render prop API]() for more compatibility. [(what are render props?)](https://reactjs.org/docs/render-props.html)

```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineFetch, useDispatch, useFetch, isNormal } from 'resift';

// 1) call `defineFetch` to get a fetch factory
// a fetch factory produces "fetches"
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

  useEffect(() => {
    // 8) create a request    // 👇 these params are the request params
    const request = personFetch(expand);

    // 9) dispatch the request via an effect
    dispatch(request);
  }, [personFetch]);

  // 9) get the data and status via the `useFetch` hook
  const [person, status] = useFetch(personFetch);

  // 10) if the status isn't normal, the data is back yet
  if (!isNormal(status)) return null;

  // 11) use the data
  return <>Hello, {person.name}</>;
}

Person.propTypes = {
  personId: PropTypes.string.isRequired,
  expand: PropTypes.string,
};

export default Person;
```
