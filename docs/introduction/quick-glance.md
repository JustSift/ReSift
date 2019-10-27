---
id: quick-glance
title: Quick glance
sidebar_label: Quick glance
---

## Demo with codesandbox

<iframe src="https://codesandbox.io/embed/resift-notes-mol0k?fontsize=14" title="ReSift Notes" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
<br />

After a lot of feedback on these docs, we realized the first thing you all wanted to see was some code.

This quick glance is just that. Without too many words, here are some quick code examples that _show_ how ReSift dispatches requests, gives status updates, and pulls data from memory.

> These examples makes use of [React Hooks](https://reactjs.org/docs/hooks-intro.html). If you're not familiar with React Hooks, these examples may look a bit foreign as they are hooks idiomatic.
>
> This library is hooks-first, meaning it's meant to be used with newer function components. If you would like to use this library with classes, [see this guide](../guides/usage-with-classes.md).

`Person.js`

```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useStatus, isLoading, Guard } from 'resift';
import SpinnerOverlay from './SpinnerOverlay';

// import a pre-defined fetch factory
import makeGetPerson from './makeGetPerson';

function Person({ personId, expand }) {
  const dispatch = useDispatch();

  // make a fetch from a fetch factory
  const getPerson = makeGetPerson(personId);
  // fetches 👆 are nouns
  //                 this is a 👆 fetch factory

  // use an effect to re-dispatch requests when the fetch changes
  // or its request args changes
  useEffect(() => {
    dispatch(getPerson(expand));
  }, [dispatch, getPerson, expand]);

  // get the status associated with your fetch
  const status = useStatus(getPerson);

  return (
    <div>
      {/* show a spinner overlay during the initial fetch or any re-fetches */}
      {isLoading(status) && <SpinnerOverlay />}

      {/* the guard ensures that the data will be there */}
      <Guard fetch={getPerson}>{person => <div>Hello, {person.name}!</div>}</Guard>
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

`makeGetPerson.js`

```js
import { defineFetch } from 'resift';

// `makeGetPerson` is a "fetch factory" which defines what this fetch does and
// how it gets data
const makeGetPerson = defineFetch({
  displayName: 'Get Person',

  // These 👇 are the arguments to `makeGetPerson`
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

export default makeGetPerson;
```

Intrigued? Continue to the [Main Concepts](../main-concepts/whats-a-fetch.md) to learn more.
