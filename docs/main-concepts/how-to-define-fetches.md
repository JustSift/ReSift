---
id: how-to-define-fetches
title: How to define a fetch
sidebar_label: How to define a fetch
---

The `defineFetch` API has the following shape:

`makePersonFetch.js`

```js
import { defineFetch } from 'resift';

const makePersonFetch = defineFetch({
  displayName: /* {display name} */,
  make: (/* {make args} */) => ({
    key: /* {key} */,
    request: (/* {request args} */) => ({ http }) => {
      /* {request body} */
    },
  }),
});

export default makePersonFetch;
```

There is:

- the `displayName`,
- the `make` function and its arguments
  - the `key`
  - the `request` function and its arguments, and
    - the request body

The following sections will go over how to fill out this shape.

---

## The `displayName`

The display name should be a human readable string to help you debug. These display names are seen in the [Dev Tools](../TODO.md) and can help you get some information when each fetch is dispatched, finished, or finished with errors. [See the Dev Tools section for more info.](../TODO.md)

The suggested naming convention is: **{[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operation} {Resource name}**

e.g.

- `Get Person`
- `Update Config`
- `Create Book`

> **NOTE**: it's not recommended to include the word "fetch" in your display name because it's redundant in the dev tools.

---

## The `make` function and `key`s

The `make` function defines the functionality of the fetch factory.

There are two types of fetch factories you can make:

1. A fetch factory that produces many unique fetches
2. A fetch factory that can only produce one unique fetch

### Defining a fetch factory that produces many different fetches

As a refresher, a fetch factory produces a fetch like so:

```js
const personFetch = makePersonFetch('person-id-123');
```

And, depending on the fetch factory, you may be able to produce more than one unique fetch from the same fetch factory e.g.

```js
function Example() {
  const matFetch = makePersonFetch('person-id-mat');
  const pearlFetch = makePersonFetch('person-id-pearl');

  const [mat] = useFetch(matFetch);
  const [pearl] = useFetch(pearlFetch);

  if (!mat || !pearl) return null;

  return (
    <div>
      Hello, <div>{mat.name}</div> and <div>{pearl.name}</div>!
    </div>
  );
}
```

The number of unique fetch instances a fetch factory can produce is determined by the number of unique `key` possibilities.

#### What's a `key`?

The **`key`** is an array of strings (or numbers) that will be used to store and lookup the data and status associated with your fetch.

The `key` is defined in the object returned by `make`:

```js
const makePersonFetch = defineFetch({
  displayName: 'Get Person',
  make: personId => ({
    // this 👇 is the "key" of this fetch
    key: [personId],
    //      👆

    request: // ...
  }),
});
```

In the `makePersonFetch` `Example` component above, when different `personId`s were passed into the fetch factory, they returned different fetches. However if you passed the same `personId` into the fetch factory, you'd get back the same fetch.

```js
const matFetch_1 = makePersonFetch('person-id-mat');
const matFetch_2 = makePersonFetch('person-id-mat');

console.log(matFetch_1 === matFetch_2); // true
```

> **Technical Note:** This works because the fetch factory is [_memoized_](https://en.wikipedia.org/wiki/Memoization) against the key to return the same fetch reference.

### Defining a fetch factory that can only produce one unique fetch

On the flip side, if your `key` is defined as an empty array, then it can only produce one unique fetch because, no matter the fetch factory arguments, there is only one possible key–the empty array.

Take a look at this example of a fetch factory that can only produce one unique fetch:

`configurationFetch.js`

```js
import { defineFetch } from 'resift';

const makeConfigurationFetch = defineFetch({
  displayName: 'Get Configuration',
  make: () => ({
    key: [],
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: '/configuration',
      }),
  }),
});

const configurationFetch = makeConfigurationFetch();
export default configurationFetch;
```

In the example above, we're defining a fetch factory to grab some app-wide configuration. There's only one configuration for the current logged-in user so there is no need to provide any keys or identifiers.

As a result, the `key` array is empty and whenever we call `makeConfigurationFetch()`, we'll always get back the same fetch instance.

These fetches that can only produce one fetch instance are called **singleton fetches**.

> As a good practice, singleton fetch factories should immediately call themselves to produce their singleton fetch (as demonstrated above). This singleton fetch can then be exported and used directly in `useFetch` in other components.

Now that we know how to define `key`s, let's learn how to define the `request`!

---

## The `make` function and `request`s

The `request` function…

```js
const makePersonFetch = defineFetch({
  displayName: 'Get Person',
  make: personId => ({
    key: [personId],

    // 👇👇👇 (that's this thing)
    request: () => ({ http }) => http(/* */),
    // 👆👆👆
  }),
});
```

…defines how to request data from ReSift's [data services](../TODO.md).

You define the `request` function as a [curried function](https://stackoverflow.com/a/36321/5776910) that separates the application of request arguments from the application of [data service](../TODO.md) arguments.

### What are request arguments?

When you [dispatch a request](./whats-a-fetch.md#making-a-request-then-dispatching-it), the first set of arguments of the `request` function become the **request arguments**.

```js
import { defineFetch } from 'resift';

const makeUpdatePersonFetch = defineFetch({
  displayName: 'Update Person',
  make: personId => ({
    key: [personId],

    // these 👇👇👇
    request: updatedPerson => ({ http }) =>
      //      👆👆👆
      // are the request arguments

      http({
        method: 'PUT',
        route: `/people/${personId}`,
        data: updatedPerson,
      }),
  }),
});
```

In the above example, `updatedPerson` is the request argument. This means that you must call the fetch instance with an `updatedPerson` in order to dispatch a request.

```js
import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'resift';
import getPersonFromForm from './getPersonFromForm';

import makeUpdatePersonFetch from './makeUpdatePersonFetch';

function ExamplePersonForm({ personId }) {
  const dispatch = useDispatch();
  const updatePersonFetch = makeUpdatePersonFetch(personId);

  const handleSubmit = e => {
    const updatedPerson = getPersonFromForm(e);

    // In order to create a request to dispatch, `updatedPerson`
    // must be passed to the fetch because it's a request argument.
    //                                  👇👇👇
    const request = updatePersonFetch(updatedPerson);
    //                                  👆👆👆

    dispatch(request);
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}

ExamplePersonForm.propTypes = {
  personId: PropTypes.string.isRequired,
};

export default ExamplePersonForm;
```

### What are data service arguments?

The next set of arguments in the curried `request` function is the [data service](../TODO.md) arguments.

```js
import { defineFetch } from 'resift';

const makeUpdatePersonFetch = defineFetch({
  displayName: 'Update Person',
  make: personId => ({
    key: [personId],

    //                   these 👇👇👇
    request: updatedPerson => ({ http }) =>
      //                       👆👆👆
      //        are the data service arguments

      http({
        method: 'PUT',
        route: `/people/${personId}`,
        data: updatedPerson,
      }),
  }),
});
```

The **data service arguments** pick off (via destructing) a [**data service**](../TODO.md) to use to request data.

Back

## Fetch definition tips

### Make args vs request args

### Suggested naming and file conventions

The suggested convention is to create a separate file for each fetch factory you define and export that fetch factory as the `default` export. Fetches that share similar resources should also share the same folder.

Then the file name should follow these rules:

- If your fetch factory produces multiple fetch instances, then suggested convention is to prefix the name with `make-`. Otherwise, if your fetch is a singleton fetch, you may omit this prefix.
- If your fetch is performs a mutation (i.e. create, update, delete) then your fetch should contain the word `Create`, `Update`, or `Delete`. If your fetch is a read operation (e.g. `Get`) then you may omit this prefix.
- The name of the resource in consideration (e.g. `Person`, `Books`) considering whether or not the update or read is plural or not. (e.g. `makePersonFetch` vs `makePeopleFetch`)
- Lastly, always postfix your name with `-fetch`.

![how to name fetches](/img/how-to-name-fetches.png)

---

I didn't know where to put this yet

> **NOTE:** Internally, ReSift will join your strings together to create one key string. You should rarely need to do any string interpolation yourself.
>
> Additionally, you should rarely need to hard-code any string literals in this key because the keys are used to differentiate one fetch instance from another fetch instance using _dynamic_ identifiers that are passed in via fetch factory arguments. If you hard-code a key, that will not change between fetch instances.
