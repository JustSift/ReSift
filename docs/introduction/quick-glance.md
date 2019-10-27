---
id: quick-glance
title: Quick glance
sidebar_label: Quick glance
---

After a lot of feedback on these docs, we realized the first thing you all wanted to see was some code.

This quick glance is just that. Without too many words, here are some quick code examples that _show_ how ReSift dispatches requests, gives status updates, and pulls data from memory.

> These examples makes use of [React Hooks](https://reactjs.org/docs/hooks-intro.html). If you're not familiar with React Hooks, these examples may look a bit foreign as they are hooks idiomatic.
>
> This library is hooks-first, meaning it's meant to be used with function components. If you would like to use this library with classes, [see this guide](../guides/usage-with-classes.md).

`Person.js`

```js
import React, { useEffect } from 'react';
import { useDispatch, useStatus, isLoading, Guard } from 'resift';
import SpinnerOverlay from './SpinnerOverlay';

// import a pre-defined "fetch factory"
import makeGetPerson from './makeGetPerson';

function Person({ personId }) {
  const dispatch = useDispatch();

  // make a "fetch instance" from a fetch factory
  const getPerson = makeGetPerson(personId);
  // fetches 👆 are nouns
  //                 this is a 👆 fetch factory

  // use an effect to re-dispatch requests when the fetch changes
  useEffect(() => {
    // NOTE: this dispatching doesn't have to occur in this
    // component. you can initiate the fetch from any component
    // because ReSift's fetches are _global_.
    dispatch(getPerson());
  }, [dispatch, getPerson]);

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
    request: () => ({ http }) =>
      //      The http  👆 service is being "picked off" and used
      //      to send off the request
      http({
        method: 'GET',
        route: `/people/${personId}`,
      }),
  }),
});

export default makeGetPerson;
```

Intrigued? This only scratches the surface. Check out the demo below!

## Demo app

This is a full demo application including:

- all CRUD actions,
- updating data across different "namespaces", and
- carefully placed loading spinners.

It's note taking app! Read the pre-made notes to learn more, then edit the code to get better idea of how it works.

<iframe src="https://codesandbox.io/embed/resift-notesj-xwp9r?fontsize=14" title="ReSift Notes" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
<br />

When you're done, continue to our [Tutorial](../tutorial-resift-rentals.md) or the [Main Concepts](../main-concepts/whats-a-fetch.md) to learn more!
