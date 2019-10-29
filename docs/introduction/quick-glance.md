---
id: quick-glance
title: Quick glance
sidebar_label: Quick glance
---

**ReSift is the [Relay](https://relay.dev/)/[Apollo](https://www.apollographql.com/docs/react/) of REST.**

This just means that we've taken the time understand why tools like Relay and Apollo are good and apply that knowledge to ReSift.

[(see here for a comparison)](../guides/resift-vs-apollo-relay.md)

---

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

---

Use this fetch factory to:

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
  const getPerson = makeGetPerson(personId);

  useEffect(() => {
    // 1) kick off the initial request
    dispatch(getPerson());
  }, [dispatch, getPerson]);

  // 2) get the status of the fetch
  const status = useStatus(getPerson);

  return (
    <div>
      {isLoading(status) && <div>Loading...</div>}

      {/* 3) pull data from a _pre-loaded_ fetch */}
      <Guard fetch={getPerson}>{person => <>Hello, {person.name}!</>}</Guard>
    </div>
  );
}

export default Person;
```

Intrigued? This only scratches the surface. Check out the demo next!
