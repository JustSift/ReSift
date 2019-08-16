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
  - the `key` array
  - the `request` function and its arguments, and
    - the request body

The following sections will go over how to fill out this shape.

---

## The `displayName`

The display name should be a human readable string to help you debug. These display names are seen in the [Dev Tools](../TODO.md) and can help you get some information when each fetch is dispatched, finished, or finished with errors. [See the Dev Tools section for more info.](../TODO.md)

The suggested naming convention is: **{[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operation} {Resource name}**

e.g.

- `Get Person`
- `Get People`
- `Update Config`
- `Create Book`

> **NOTE**: it's not recommended to include the word "fetch" in your display name because it's redundant in the dev tools.

---

## The `make` function and the `key`

The `make` function defines the functionality of a fetch factory.

Depending on your `key`, there are two types of fetch factories you can make:

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

The number of unique fetches a fetch factory can produce is determined by the number of unique `key` possibilities.

#### What's a `key`?

The **`key`** is an array of strings (or numbers) that will be used to store and lookup the data associated with your fetch.

The `key` is defined in the object returned by `make`:

```js
const makePersonFetch = defineFetch({
  displayName: 'Get Person',
  make: personId => ({
    // this 👇👇👇 is the "key" of this fetch
    key: [personId],
    //     👆👆👆

    request: // ...
  }),
});
```

In the `Example` component above, when different `personId`s were passed into the fetch factory, they returned different fetch instances. However if you pass the same `personId` into the fetch factory, you'd get back the same fetch instance.

```js
const matFetch_1 = makePersonFetch('person-id-mat');
const matFetch_2 = makePersonFetch('person-id-mat');

console.log(matFetch_1 === matFetch_2); // true
```

> **Technical Note:** This works because the fetch factory is [_memoized_](https://en.wikipedia.org/wiki/Memoization) against the key to return the same fetch reference.

### Defining a fetch factory that can only produce one unique fetch

On the flip side, if your `key` is defined as an empty array, then it can only produce one unique fetch instance because, no matter the fetch factory arguments, there is only one possible key—the empty array.

Take a look at this example of a fetch factory that can only produce one fetch instance:

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

In the example above, we're defining a fetch factory to grab some app-wide configuration. There is only one config and this config doesn't have an ID.

As a result, the `key` array is empty, and, whenever we call `makeConfigurationFetch()`, we'll always get back the same fetch instance.

Fetch factories and fetches instances that can only produce one fetch are called **singleton fetches**.

> As a good practice, singleton fetch factories should immediately call themselves to produce their singleton fetch (as demonstrated above). This singleton fetch can be exported and then used directly in `useFetch` without having to call the fetch factory every time.

---

## The `make` function and the `request`

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

You define the `request` function as a [curried function](https://stackoverflow.com/a/36321/5776910) that separates the application of "request arguments" from the application of "[data service](../TODO.md) arguments".

### What are request arguments?

The **request arguments** are the arguments to the outer function of the `request` function.

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

When you [dispatch a request](./whats-a-fetch.md#making-a-request-then-dispatching-it), you must provide the request arguments.

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
    // must be passed here because it's a required request argument.
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

The inner set of arguments in the curried `request` function is the [data service](../TODO.md) argument.

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

The **data service argument** is an object that you can [destructure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Unpacking_fields_from_objects_passed_as_function_parameter) to "pick off" a [data service](../TODO.md). This data service can then be used to make data calls to your backend.

> Hang tight for now! There is an [in-depth tutorial on data services in a later doc](../TODO.md) that details this more. For now, just know what the data service argument is.

### The request body

The request body is the rest of the `request`. It is where you use the data services you've picked off and make requests to your backend.

```js
import { defineFetch } from 'resift';

const makePersonFetch = defineFetch({
  displayName: 'Get Person',
  make: personId => ({
    key: [personId],
    request: () => async ({ http }) => {
      // 👇👇👇 this is the request body
      const person = await http({
        method: 'GET',
        route: `/people/${personId}`,
      });

      return person;
      // 👆👆👆
    },
  }),
});
```

The request body should return a `Promise`. ReSift will `await` this promise and store the result.

Placing `async` before the request body allows you to `await` data services. In fact, you may call these services more than once within one ReSift request.

```js
import { defineFetch } from 'resift';

const makeMyFetch = defineFetch({
  displayName: 'Get Resource',
  make: id => ({
    key: [id],
    request: requestArg => async ({ http }) => {
      const dataResultOne = await http({
        method: 'GET',
        route: '/one',
      });

      const dataResultTwo = await http({
        method: 'GET',
        route: `/two/${dataResultOne.id}`,
      });

      return dataResultTwo;
    },
  }),
});
```

---

## Good practices

### Suggested naming and file conventions

- The suggested convention is to create a separate file for each fetch factory.
- If the fetch factory is a [singleton fetch](#defining-a-fetch-factory-that-can-only-produce-one-unique-fetch), then immediately invoke the singleton fetch factory and then `export default` the resulting fetch.
- Otherwise, `export default` the fetch factory.

Then the file name should follow these rules in order:

1. If your fetch factory can produce multiple fetch instances, then prefix the name with `make-`. Otherwise, if your fetch is a singleton fetch, you may omit this prefix.
2. If your fetch performs a mutation (i.e. create, update, delete) then your fetch should add the word `Create`, `Update`, or `Delete` next. If your fetch is a read operation (i.e. `Get`) then you may omit this prefix.
3. Next, add the name of the resource in consideration (e.g. `Person`, `Books`) considering whether or not the resource is plural or not. (e.g. `makePersonFetch` vs `peopleFetch`)
4. Lastly, always postfix your name with `-Fetch`.

Examples:

- `makePersonUpdateFetch.js` — non-singleton, `PUT` request, that updates one person
- `makePersonFetch.js` — non-singleton, `GET` request, the gets ones person.
- `configurationFetch.js` — singleton, `GET` request for the single config
- `updatePeopleFetch.js` — singleton, `PUT` request for a collection of people
