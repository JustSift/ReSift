# ReSift · [![Build Status](https://travis-ci.org/JustSift/ReSift.svg?branch=master)](https://travis-ci.org/JustSift/ReSift) [![Coverage Status](https://coveralls.io/repos/github/JustSift/ReSift/badge.svg?branch=master)](https://coveralls.io/github/JustSift/ReSift?branch=master)

**ReSift is a React state management library for fetches** with the goal of giving your team a capable standard for fetching, storing, and reacting to data with great [DX](https://hackernoon.com/the-best-practices-for-a-great-developer-experience-dx-9036834382b0).

**Features:**

- 💾 Global injectable-anywhere data cache
- 🔄 Supports ["fetch-then-render"](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-2-fetch-then-render-not-using-suspense) (with ["render-as-you-fetch"](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) coming [soon](https://github.com/JustSift/ReSift/issues/32))
- 📬 Status reporting
- 🔌 Pluggable
- 👽 Backend agnostic
- 🌐 Universal — Share code amongst your apps. **Works with React Native!**
- 🎣 Hooks API
- 🤝 Full TypeScript support

We like to think of ReSift as the [Relay](https://relay.dev/) of REST. ReSift is in the same class of tools as [Relay](https://relay.dev/) and [the Apollo Client](https://www.apollographql.com/docs/react/). However, ReSift does _not_ require GraphQL.

[See this doc for definitions and comparisons of ReSift vs Relay/Apollo](https://resift.org/docs/guides/resift-vs-apollo-relay).

---

In order to get the benefits of these frameworks within REST, we first define a ["fetch factory"](https://resift.org/docs/main-concepts/whats-a-fetch#defining-a-fetch).

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

---

Then you can use this fetch factory to:

1. kick off the initial request
2. get the status of the fetch
3. pull data from a potentially _pre-loaded_ fetch

`Person.js`

```js
import React, { useEffect } from 'react';
import { useDispatch, useStatus, isLoading, Guard } from 'resift';
import makeGetPerson from './makeGetPerson';

function Person({ personId }) {
  const dispatch = useDispatch();

  //                   👇👇👇  this is using the "fetch factory"
  const getPerson = makeGetPerson(personId);
  //      👆👆👆 this is a "fetch instance"

  useEffect(() => {
    // 1) kick off the initial request
    dispatch(getPerson());
  }, [dispatch, getPerson]);

  // 2) get the status of the fetch
  const status = useStatus(getPerson);

  return (
    <div>
      {isLoading(status) && <div>Loading...</div>}

      {/* 3) pull data from a potentially _pre-loaded_ fetch */}
      <Guard fetch={getPerson}>{person => <>Hello, {person.name}!</>}</Guard>
    </div>
  );
}

export default Person;
```

Intrigued? This only scratches the surface. [Head on over to the docs!](https://resift.org/)
