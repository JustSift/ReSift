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

## The `make` function

The `make` function defines the functionality of the fetch factory.

There are two types of fetch factories you can make:

1. A fetch factory that produces many unique fetches
2. A fetch factory that can only produce one unique fetch

## Defining a fetch factory that produces many different fetches

As a refresher, a fetch factory produces a fetch instance like so:

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

### What is a `key`?

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

In the `makePersonFetch` example above, when different `personId`s were passed into the fetch factory, they returned different fetches, however if you passed the same `personId` into the fetch factory, you'd get back the same fetch.

```js
const matFetch_1 = makePersonFetch('person-id-mat');
const matFetch_2 = makePersonFetch('person-id-mat');

console.log(matFetch_1 === matFetch_2); // true
```

> **Technical note:** This works because the fetch factory is [_memoized_](https://en.wikipedia.org/wiki/Memoization) against the key to return the same fetch reference.

---

This means that doing…

```js
const [person, status] = useFetch(personFetch);
```

…will only return the `person` with the `personId` from this component's props.

This also means that you can have more than once instance of this component, and, as long as each `personId` is different, each `person` and `status` will also be different.

> As a good practice, if your resource has an identifier and could potentially be called with different identifiers, then it's best to use `key`. Otherwise you'll may end up with bugs where one request is interfering with the result of another.

When you define a fetch factory that takes in identifier, you're defining a fetch that is allowed to have more than one fetch instance.

> Remember that a [**fetch instance**](./whats-a-fetch.md#the-lifecycle-of-a-fetch) is used to lookup the data and status associated with your request.

In order to differentiate one fetch instance from another fetch instance from the same fetch factory, use `key`.

`makePersonFetch.js`

```js
import { defineFetch } from 'resift';

const makePersonFetch = defineFetch({
  displayName: 'Get Person',
  make: personId => ({
    // =====================
    // THIS 👇 is the `key`
    key: [personId],
    //======================

    request: expand => ({ http }) =>
      http({
        method: 'GET',
        route: `/people/${personId}`,
        query: { expand },
      }),
  }),
});

export default makePersonFetch;
```

---

## Defining a fetch factory that produces one fetch instance

### What is a singleton fetch?

It's also common to have a **singleton fetch** — a fetch that does not take in a dynamic key.

In the code, this means that `key` is an empty array.

`configurationFetch.js`

```js
import { defineFetch } from 'resift';

const makeConfigurationFetch = defineFetch({
  displayName: 'Get Configuration',
  make: () => ({
    // NOTE: this is a "singleton" fetch because the key array is empty
    //   👇
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

> **NOTE:** The suggested convention for singleton fetches is to call the fetch factory once and then export the resulting fetch because the fetch will not change between fetch factory calls.
>
> See below for more on [suggested naming conventions](#suggested-naming-conventions)

`Dashboard.js` (an example component that uses the configuration)

```js
import React from 'react';
import { useFetch } from 'resift';
import configurationFetch from './configurationFetch';

function Dashboard() {
  const [configuration, status] = useFetch(configurationFetch);

  return /* ... */;
}
```

---

## Defining requests

Now that we know how to define keys, let's learn how to define the request.

### Make args vs request args

## Suggested naming and file conventions

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
