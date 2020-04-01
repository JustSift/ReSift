---
id: error-handling
title: Error handling
sidebar_label: Error handling
---

There are multiple ways you can handle errors that come in through ReSift.

There is:

- the `ERROR` status,
- the `useError` hook,
- `throw`ing the error from `useError` and using an `ErrorBoundary`
- `try` `catch`ing `dispatch`, and
- configuring the `onError` callback of the data service

## The `ERROR` status

The easiest way to handle errors is to simply tell the user that something went wrong with a static view.

You can do this using the `isError` helper from ReSift

```js
import React from 'react';
import { isError, useStatus } from 'resift';

function Person() {
  const status = useStatus(getPerson);

  const handleRetry = () => {
    // ...
  };

  if (isError(status)) {
    return <button onClick={handleRetry}>Try again?</button>;
  }

  return /* ... */;
}
```

---

⚠️ This pattern is especially helpful when combined with the `<Guard />`. We recommend you create a component built on top of `<Guard />` that uses `isError`.

For example:

```js
import React from 'react';
import { isNormal, isLoading, isError, useStatus, Guard } from 'resift';
import Spinner from './Spinner';
import ErrorView from './ErrorView';

// using inline styles to keep it simple for this example
const loaderStyles = {
  position: 'relate',
};
const overlayStyles = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function Loader({ fetch, children, ...restOfProps }) {
  const status = useStatus(fetch);

  const overlay = (() => {
    if (isLoading(status)) return <Spinner />;
    if (isError(status)) return <ErrorView />;
    return null;
  })();

  return (
    <div className="loader" style={loaderStyles} {...restOfProps}>
      {/* show this overlay only when there is an overlay view */}
      <div
        className="overlay"
        style={{
          ...overlayStyles,
          display: overlay ? 'flex' : 'none',
        }}
      >
        {overlay}
      </div>
      <Guard fetch={fetch} children={children} />
    </div>
  );
}
```

Then when you go use this Loader component, it'll always have a built-in error view.

```js
import React from 'react';
import getPerson from './getPerson';
import Loader from './Loader';

function Person({ personId }) {
  // when this component is loading, you'll see a <Spinner />,
  // if this component has an error, you'll see an <ErrorView />
  return <Loader fetch={getPerson}>{(person) => person.name}</Loader>;
}

export default Person;
```

## The `useError` hook

There's certain scenarios where you need the error payload in order to show something on the UI.

You can get the error payload using `useError`.

```js
import React from 'react';
import { useError } from 'resift';
import makeGetPerson from './getPerson';

function Person({ personId }) {
  const getPerson = makeGetPerson(personId);

  // error will be `null` if there is no error or it will contain
  // an error if any error was throw in the data service
  const error = useError(getPerson);

  const handleRetry = () => {
    // ...
  };

  if (error) {
    const { message } = error.response;
    return (
      <div>
        <h1>Something went wrong!</h1>
        <p>{message}</p>
        <button onClick={handleRetry}>Try again?</button>
      </div>
    );
  }

  return /* ... */;
}
```

> **NOTE:** Even if your fetch is [shared](./making-state-consistent.md), the error returned from `useError` will only be from the current fetch instance. In other words, errors are not shared between fetches

## `throw`ing the error from `useError` and using an Error Boundary

If you prefer, you can also check and throw the error from `useError` to be caught by an [Error Boundary](https://reactjs.org/docs/error-boundaries.html) somewhere else up in the tree.

You can write your own [error boundary component](https://reactjs.org/docs/error-boundaries.html) or you can use a predefined error boundary from [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary).

```js
import React from 'react';
import ErrorBoundary from 'react-error-boundary';
import { useError /* ... */ } from 'resift';
import makeGetPerson from './makeGetPerson';

function Person({ id }) {
  const getPerson = makeGetPerson(id);

  const error = useError(getPerson);
  if (error) {
    throw error;
  }

  return /* ... */;
}

function Parent() {
  const handleError = () => {
    // ...
  };

  return (
    <ErrorBoundary onError={handleError} FallbackComponent={ErrorView}>
      {/* the ErrorBoundary doesn't have to be the immediate parent */}
      <div className="person-container">
        <Person id="person123" />
      </div>
    </ErrorBoundary>
  );
}

// ...
```

## `try` `catch`ing `dispatch`

The `dispatch` function from `useDispatch` returns a promise and can be awaited.

In event handlers, you can `await` the `dispatch` call and also wrap it in a `try` `catch`. After the dispatch, you can either display a success message or display an error message.

```js
import React from 'react';
import { useDispatch } from 'resift';
import makeUpdatePerson from './makeUpdatePerson';
import getPersonFromEvent from './getPersonFromEvent';
import toast from './toast';

function PersonForm({ personId }) {
  const dispatch = useDispatch();

  const updatePerson = makeUpdatePerson(personId);

  const handleSave = async (e) => {
    // helper function that gets the value of the person from a form
    const person = getPersonFromEvent(e);

    try {
      // wrap dispatch in try catch
      await dispatch(updatePerson(person));

      // if the dispatch worked with no error then, this line will run
      toast('It worked!');
    } catch (e) {
      // if there was an error with the request,
      // then the "it worked" line will never run.
      // This line will run instead
      toast('Something went wrong');
    }
  };

  return /* ... */;
}
```

## The `onError` callback

The last bit of error handling possible is configuring the `onError` callback.

The `onError` callback allows you to hook into the data service whenever any data services throws any errors. You can use this callback to redirect to a login in page or to log/report any errors to your favorite error reporting tool.

```js
import _get from 'lodash/get';
import createDataService from './createDataService';
import { captureException } from '@sentry/browser';

const dataService = createDataService({
  services: {
    // ...
  },
  onError: (e) => {
    // if the error is an unauthorized error, redirect to the login page
    if (_get(e, ['status']) === 401) {
      window.location.assign('https://login.yourcompany.com');
      return;
    }

    // otherwise report the error
    captureException(e);

    // you may also want to re-throw this error.
    // (if you don't what do with this then just re-throw)
    throw e;
  },
});

export default dataService;
```

> ⚠️ In general, if you don't know what to do with this error, we recommend re-throwing it. e.g.

```js
const dataService = createDataService({
  // ...
  onError: (e) => {
    throw e;
  },
});
```
