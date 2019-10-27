---
id: how-to-define-a-fetch
title: How to define a fetch
sidebar_label: How to define a fetch
---

The `defineFetch` API has the following shape:

`makeGetPerson.js`

```js
import { defineFetch } from 'resift';

const makeGetPerson = defineFetch({
  displayName: /* {display name} */,
  make: (/* {make params} */) => ({
    request: (/* {request params} */) => ({ http }) => {
      /* {request body} */
    },
  }),
});

export default makeGetPerson;
```

There is:

- the `displayName`,
- the `make` function and its parameters/arguments, and
- the `request` function and its parameters/arguments.

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

## The `make` function

The `make` function defines two things:

1. how your fetch factory will make fetch instances and
2. how your fetch instances will get their data (aka the `request`, [discussed later](#the-request-function)).

### Defining how your fetch factory will make fetch instances

You define how your fetch factory will make fetch instances by defining the parameters of the `make` function. The parameters of the make function become the parameters of your fetch factory.

```js
const makeGetPerson = defineFetch({
  displayName: 'Get Person',
  make: personId => () => /* ... */,
}); //   👆
//       👆
//       👆                these arguments -> 👇
//       👆 <- will populate these parameters 👇
//                                            👇
const getPerson = makeGetPerson('some-person-id-123');
```

> 👇👇👇<br /> **Key idea:** These `make` parameters are important because they function as the ID of your fetch.

Calling a fetch factory twice with the same ID will result in the same fetch instance. e.g.

```js
const makeGetPerson = defineFetch(/* ... */);
const getPerson123 = makeGetPerson('123');
const alsoGetPerson123 = makeGetPerson('123');

console.log(getPerson123 === alsoGetPerson123); // true
```

Passing the same fetch into ReSift functions (such as `useData`) will have the same result too. e.g.

```js
const makeGetPerson = defineFetch(/* ... */);
const getPerson123 = makeGetPerson('123');
const alsoGetPerson123 = makeGetPerson('123');

const data = useData(getPerson123);
const sameData = useData(alsoGetPerson123);

console.log(data === sameData); // true
```

### Special case: singleton fetches

If your `make` function does not have any parameters, (i.e., has no ID), then it's considered to be a **singleton fetch**.

`getConfiguration.js`

```js
import { defineFetch } from 'resift';

const makeGetConfiguration = defineFetch({
  displayName: 'Get Configuration',
  //    👇 no parameters === singleton fetch
  make: () => ({ http }) =>
    http({
      method: 'GET',
      route: '/configuration',
    }),
});

const getConfiguration = makeGetConfiguration();
export default getConfiguration;
```

As a good practice, singleton fetch factories should immediately call themselves to produce their singleton fetch (as demonstrated above). This singleton fetch can be exported and then used directly in `useData`, `useStatus`, and `<Guard />`s without having to produce the fetch every time.

---

## The `request` function

The `request` function…

```js
const makeGetPerson = defineFetch({
  displayName: 'Get Person',
  make: personId => ({
    // 👇👇👇 that's this thing
    request: () => ({ http }) => http(/* */),
    // 👆👆👆
  }),
});
```

…defines how to request data from ReSift's [data services](../TODO.md).

You define the `request` function as a [curried function](https://stackoverflow.com/a/36321/5776910) that separates the application of "request arguments" from the application of "[data service](../TODO.md) arguments".

### What are request arguments/parameter?

The **request arguments/parameters** are the parameters to the outer function of the `request` function.

```js
import { defineFetch } from 'resift';

const makeUpdatePerson = defineFetch({
  displayName: 'Update Person',
  make: personId => ({
    //    these 👇👇👇
    request: updatedPerson => ({ http }) =>
      //        👆👆👆
      // are the request parameters

      http({
        method: 'PUT',
        route: `/people/${personId}`,
        data: updatedPerson,
      }),
  }),
});
```

When you [dispatch a request](./whats-a-fetch.md#dispatching-requests), you must provide the request arguments.

In the above example, `updatedPerson` is the request parameter. This means that you must call the fetch instance with an `updatedPerson` in order to dispatch a request.

```js
import React from 'react';
import { useDispatch } from 'resift';

import makeUpdatePerson from './makeUpdatePerson';

const getPersonFromForm = e => /* ... */;

function ExamplePersonForm({ personId }) {
  const dispatch = useDispatch();
  const updatePerson = makeUpdatePerson(personId);

  const handleSubmit = e => {
    const updatedPerson = getPersonFromForm(e);

    // In order to create a request to dispatch, `updatedPerson`
    // must be passed here because it's a required request argument.
    //                       👇👇👇
    dispatch(updatePerson(updatedPerson));
    //                       👆👆👆
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}

export default ExamplePersonForm;
```

### What are data service parameters?

The inner set of parameters in the curried `request` function is the [data service](../TODO.md) parameter.

```js
const makeUpdatePerson = defineFetch({
  displayName: 'Update Person',
  make: personId => ({
    //                     this 👇👇👇
    request: updatedPerson => ({ http }) =>
      //                        👆👆👆
      //        is the data service parameter

      http({
        method: 'PUT',
        route: `/people/${personId}`,
        data: updatedPerson,
      }),
  }),
});
```

The **data service parameter** is an object that you can [destructure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Unpacking_fields_from_objects_passed_as_function_parameter) to "pick off" a [data service](../TODO.md). This data service can then be used to make data calls to your backend.

> Hang tight for now! There is an [in-depth tutorial on data services in a later doc](../TODO.md) that details this more. For now, just know what the data service argument is.

### The `request` function body

The `request` function body is the rest of the `request`. It is where you use the data services you've picked off and make requests to your backend.

```js
const makeGetPerson = defineFetch({
  displayName: 'Get Person',
  make: personId => ({
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
const makeGetResource = defineFetch({
  displayName: 'Get Resource',
  make: id => ({
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
- If the fetch factory is a [singleton fetch](#special-case-singleton-fetches), then immediately invoke the singleton fetch factory and then `export default` the resulting fetch.
- Otherwise, `export default` the fetch factory.

Then the file name should follow these rules in order:

1. If your fetch factory can produce multiple fetch instances, then prefix the name with `make`. Otherwise, if your fetch is a singleton fetch, you may omit this prefix.
2. Add the CRUD operation to that corresponds with your fetch. We suggest using `Create`, `Get`, `Update`, and `Delete`.
3. Lastly, add the name of the resource in consideration (e.g. `Person`, `Books`) considering whether or not the resource is plural or not. (e.g. `makeGetPerson` vs `getPeople`)

Examples:

- `makeUpdatePerson.js` — non-singleton fetch, `PUT` request, that updates one person
- `makeGetPerson.js` — non-singleton fetch, `GET` request, the gets ones person
- `getConfiguration.js` — singleton fetch, `GET` request for the single config
- `updatePeople.js` — singleton fetch, `PUT` request for a collection of people
