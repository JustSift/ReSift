---
id: what-is-resift
title: What is ReSift?
sidebar_label: What is ReSift?
---

## Introduction

ReSift is a React state management library for fetches with the goal of giving your team a capable standard for fetching, storing, and reacting to data with a great developer experience.

**Features:**

- 💾 Global, consistent, injectable-anywhere data cache
- 🔄 Supports ["fetch-then-render"](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-2-fetch-then-render-not-using-suspense) (with ["render-as-you-fetch"](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) coming [soon](https://github.com/JustSift/ReSift/issues/32))
- 📬 Status reporting
- 🔌 Pluggable
- 🔗 REST oriented
- 👽 Backend agnostic
- 🌐 Universal — Share code amongst your apps. **Works with React Native!**
- 🎣 Hooks API
- 🤝 Full TypeScript support

We like to think of ReSift as the [Relay](https://relay.dev/) of REST. ReSift is in the same class of tools as [Relay](https://relay.dev/) and [the Apollo Client](https://www.apollographql.com/docs/react/). However, **ReSift does not require GraphQL**.

[See this doc for definitions and comparisons of ReSift vs Relay/Apollo](../guides/resift-vs-apollo-relay.md).

## Basic usage

In order to get the benefits of these frameworks within REST, we first define a ["fetch factory"](../main-concepts/whats-a-fetch.md#defining-a-fetch).

`makeGetPerson.js`

```js
import { defineFetch } from 'resift';

//        👇 this is a fetch factory
//
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

Then you can use this fetch factory to:

1. kick off the initial request
2. get the status of the fetch
3. pull data from the fetch

`Person.js`

```js
import React, { useEffect } from 'react';
import { useDispatch, useStatus, useData, isLoading } from 'resift';
import makeGetPerson from './makeGetPerson';

function Person({ personId }) {
  const dispatch = useDispatch();

  const getPerson = makeGetPerson(personId);
  //     👆👆👆 this is a "fetch"

  useEffect(() => {
    // 1) kick off the initial request
    dispatch(getPerson());
  }, [dispatch, getPerson]);

  // 2) get the status of the fetch
  const status = useStatus(getPerson);

  // 3) pull data from the fetch
  const person = useData(getPerson);

  return (
    <div>
      {isLoading(status) && <div>Loading...</div>}
      {person && <>Hello, {person.name}!</>}
    </div>
  );
}

export default Person;
```

> In this basic example, we fetched and pulled data in the same component, but with ReSift, you don't have to!
>
> **With ReSift, you can dispatch a fetch in one component and pull it from another. This makes it much easier to reuse data across components and enables the concept of pre-fetching**

## Why ReSift?

What's wrong with [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)? Why use ReSift over traditional methods?

**To put it simply, `window.fetch` (or [similar](https://github.com/axios/axios)), isn't a state management library.**<br />
It's _just_ a function that returns a promise of your data.

"State management" is up to you. If your application doesn't have a lot of changing state regarding data fetches, then it's easy to manage this state by yourself and you should.

However, you may not be so lucky. Here are some questions to help you consider if you should use this library:

- Does your app have to load data from multiple different endpoints?
- Do you want to cache the results of these fetches?
- Are you reusing this data across different components?
- Do you want state to stay consistent and update components when you do PUT, POST, etc?
- Do you have a plan for reporting loading and error statuses?
- Is it easy to onboard new members of your team to your data state management solution?

ReSift is an opinionated state management solution for data fetches for REST-oriented applications.

You could manage the state of your data fetches yourself (using Redux or similar) to get the same benefits but the question is: Do you want to?

Are you confident that your solution is something your team can follow easily? Does it scale well? Is it reusable?

If you answered "No" to any of those questions then give ReSift a try.

Check out the demo app on the next page, look through the code, read the docs, then [let us know what you think](https://forms.gle/YyajQnLXHFb1yunHA)!
