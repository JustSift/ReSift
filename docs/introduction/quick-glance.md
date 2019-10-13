---
id: quick-glance
title: Quick glance
sidebar_label: Quick glance
---

After a lot of feedback on these docs, we realized the first thing you all wanted to see was some code.

This quick glance is just that. Without too many words, here are some quick code examples that _show_ how ReSift dispatches requests, gives status updates, and pulls data from memory.

> These examples makes use of [React Hooks](https://reactjs.org/docs/hooks-intro.html). If you're not familiar with React Hooks, these examples may look a bit foreign as they are hooks idiomatic.
>
> We recommend using our hooks API, but if you're not comfortable, we do offer a way to use this library with [React-Redux's `connect`](../TODO.md) for more compatibility.

`Person.js`

```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useFetch, isLoading } from 'resift';
import SpinnerOverlay from './SpinnerOverlay';

// import a pre-defined fetch factory
import makePersonFetch from './makePersonFetch';

function Person({ personId, expand }) {
  const dispatch = useDispatch();

  // make a fetch from a fetch factory
  const personFetch = makePersonFetch(personId);
  // fetches 👆 are nouns
  //                 this is a 👆 fetch factory

  // use an effect to re-dispatch requests when the fetch itself
  // or any of the request arguments change (e.g. `expand`)
  useEffect(() => {
    dispatch(personFetch(expand));
  }, [dispatch, personFetch, expand]);

  // get the data and the status associated with your fetch
  const [person, status] = useFetch(personFetch);
  //                          👆
  // this hook causes re-renders when the status or the response changes

  return (
    <div>
      {/* show a spinner overlay during the initial fetch or any re-fetches */}
      {isLoading(status) && <SpinnerOverlay />}

      {/* when the response comes back, the person will no longer be null */}
      {person && <div>Hello, {person.name}!</div>}
    </div>
  );
}

Person.propTypes = {
  personId: PropTypes.string.isRequired,
  expand: PropTypes.string,
};

export default Person;
```

---

`makePersonFetch.js`

```js
import { defineFetch } from 'resift';

// `makePersonFetch` is a "fetch factory" which defines what this fetch does and
// how it gets data
const makePersonFetch = defineFetch({
  displayName: 'Get Person',

  // These 👇 are the arguments to `makePersonFetch`
  make: personId => ({

    // The `request` which is responsible for sending off the request
    //   These 👇 are the arguments when dispatching
    request: expand => ({ http }) =>
      //        The http  👆 service is being "picked off" and used
      //        to send off the request
      http({
        method: 'GET',
        route: `/people/${personId}`,
        // This will add the query param `expand` to the request
        // e.g. `/people/person123?expand=blah
        query: { expand },
      }),
  }),
});

export default makePersonFetch;
```

Intrigued? Continue to the [Main Concepts]() to learn more.
