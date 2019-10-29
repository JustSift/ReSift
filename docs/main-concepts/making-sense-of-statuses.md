---
id: making-sense-of-statuses
title: Making sense of statuses
sidebar_label: Making sense of statuses
---

In the previous section, we went over how to use fetches and get data out of them. You saw how `useStatus` returned _something_ and how you can pass that something into helper functions like `isLoading`:

```js
function MyComponent() {
  const status = useStatus(getPerson);

  if (!isNormal(status)) return <Spinner />;

  return; // ...
}
```

So what is that `status` thing?

If you `console.log` it, you'll get a strange and seemingly random number.

Why? Because it's [bitmask](https://dev.to/somedood/bitmasks-a-very-esoteric-and-impractical-way-of-managing-booleans-1hlf).

---

A bitmask is a number that encodes multiple different boolean values in a single number.

Though you might think this is over engineered, it's not!

When statuses are just plain ole numbers, it saves you the pain of having to memoize them. This means that you can pass statuses into components, hooks, and more without having to worry about reference issues.

## The different kinds of statuses

There are 4 different statuses in Resift:

1. `ERROR` - true when the action resulted in an error
2. `LOADING` - true when there is an inflight request for data
3. `NORMAL` - true when there is available data from the data service
4. `UNKNOWN` - true when none of the above are true

> **Note:** these statuses (besides `UNKNOWN`) are **not mutually exclusive**. e.g. a status can be `NORMAL` _and_ `LOADING` denoting that there is an inflight request and there is data available from a previous request

If you ever need to (though you probably won't), you can import these statuses values as numbers from resift like so:

```js
import { ERROR, LOADING, NORMAL, UNKNOWN } from 'resift';
```

## Checking the status of a status

To check if a status is `NORMAL` or is `ERROR` import the `isNormal` or `isError` from resift.

```js
import { isError, isLoading, isNormal, isUnknown, useStatus, useData } from 'resift';

import Spinner from '...';
import ErrorView from '...';
import Person from './Person';

function Component() {
  const status = useStatus(getPerson);
  const person = useData(getPerson);

  if (isLoading(status)) return <Spinner />;
  if (isError(status)) return <ErrorView />;
  if (isNormal(status)) return <Person person={person} />;
  return null;
}

export default Component;
```

## Checking the status of multiple statuses

You can also supply more than one status to any of the functions above to get an overall status of each status passed in.

Here is the logic for each type of check:

- **`isLoading`** - at least one must have `LOADING` for this to be true
- **`isNormal`** - all statuses must have `NORMAL` for this to be true
- **`isError`** - at least one must have `ERROR` for this to be true
- **`isUnknown`** - all statuses must be `UNKNOWN` for this to be true

```js
import { useStatus, isLoading } from 'resift';

import { fetchPerson } from 'store/people';

function Container() {
  const status123 = useStatus(getPerson123);
  const status456 = useStatus(getPerson456);

  const atLeastOneLoading = isLoading(status123, status456);
  const allAreNormal = isNormal(status123, status456);
  const atLeastOneError = isError(status123, status456);
  const allAreUnknown = isUnknown(status123, status456);

  // ...
}
```

## Combining statuses

You can combine statuses using the same logic as above with the function `combineStatuses` from `'resift'`.

```js
import { combineStatuses, useStatus } from 'resift';

function MyComponent() {
  const getPerson123 = makeGetPerson('123');
  const getPerson456 = makeGetPerson('456');

  const status123 = useStatus(getPerson123);
  const status456 = useStatus(getPerson456);

  const status = combineStatuses(status123, status456);

  // ...
}
```

## The behavior of shared fetches

You might have noticed that when you have a shared fetch, its status is affected by any fetch instances that are loading.

So for example, if you had two fetches that were shared e.g. `getPerson` and `updatePerson`, then when the `updatePerson` fetch has a status of `LOADING` so does the `getPerson` fetch. This is intensional. However, if you would only like the status of your fetch to be the fetch in question (vs a combined status of all the related shared fetches), then you pass the option `isolatedStatus: true` to the options fo `useStatus`.

```js
function MyComponent() {
  const updateStatus = useStatus(updatePerson, {
    isolatedStatus: true, // 👈 this tells resift to only consider the status of `updatePerson`
  });

  if (isLoading(updateStatus)) {
    // ...
  }

  return /* ... */;
}
```
