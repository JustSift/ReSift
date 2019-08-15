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

The display name should be a human readable string to help you debug. These display names are seen in the Redux Dev Tools and can help you get some information when each fetch is dispatched, finished, or finished with errors. [See the Dev Tools section for more info.](../TODO.md)

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

1. A fetch factory for resources with different identifiers
2. A fetch factory for a singleton resource

## Defining a fetch for a resource with an identifier

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

### What is a `key`?

The `key` is an array of strings (or numbers) that will be used to store and lookup the data and status associated with your fetch.

> **NOTE:** Internally, ReSift will join your strings together to create one key string. You should rarely need to do any string interpolation yourself.
>
> Additionally, you should rarely need to hard-code any string literals in this key because the keys are used to differentiate one fetch instance from another fetch instance using _dynamic_ identifiers that are passed in via fetch factory arguments. If you hard-code a key, that will not change between fetch instances.

Take a close look at this example and the comments:

```js
import React from 'react';
import PropTypes from 'prop-types';
import { useFetch } from 'resift';
import makePersonFetch from './makePersonFetch';

function Person({ personId, expand }) {
  // `makePersonFetch` is a fetch factory.
  // The arguments to `makePersonFetch` are the arguments of `make` in
  // `defineFetch` above.               👇
  const personFetch = makePersonFetch(personId);
  //                                     👆
  // `personId` will now be used in the `key` of the fetch above.
  // This key will be used to differentiate this `personFetch` from other
  // "person fetches" from this same `makePersonFetch`, fetch factory

  const [person, status] = useFetch(personFetch);

  useEffect(() => {
    dispatch(personFetch(expand));
  }, [personFetch, expand]);

  return /* ... */;
}

Person.propTypes = {
  personId: PropTypes.string.isRequired,
  expand: PropTypes.string.isRequired,
};
```

In the example above, the `personId` from props is passed into `makePersonFetch`. This `personId` will be passed into the `key` array of the fetch factory.

The resulting fetch _captures that `personId`_.

---

This means that doing…

```js
const [person, status] = useFetch(personFetch);
```

…will only return the `person` with the `personId` from this component's props.

This also means that you can have more than once instance of this component, and, as long as each `personId` is different, each `person` and `status` will also be different.

> As a good practice, if your resource has an identifier and could potentially be called with different identifiers, then it's best to use `key`. Otherwise you'll may end up with bugs where one request is interfering with the result of another.

---

## Defining a fetch for a singleton resource

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
