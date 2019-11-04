---
id: custom-hooks
title: Custom hooks
sidebar_label: Custom hooks
---

The last concept we want to highlight is [custom hooks](https://reactjs.org/docs/hooks-custom.html).

[React hooks](https://reactjs.org/docs/hooks-intro.html) are great because they allow you to build on top of other existing hooks. They allow you to generalize many of the common tasks you'll do in your application.

This is why ReSift's APIs are hooks based — **so you can build on top of them** and combine them with other custom hooks.

---

Below is a simple demo of a list. When you select an item from the list, the details show up on the right.

The data in this list is powered by the custom hook `useCurrentPerson`.

`useCurrentPerson` combines ReSift's `useData` hook with React Router's [`useRouteMatch` hook](https://reacttraining.com/react-router/web/api/Hooks/useroutematch) to grab the current item using an ID from URL.

`useCurrentPerson.js`

```js
import { useEffect } from 'react';
import { useData, useDispatch, useStatus } from 'resift';
import { useRouteMatch } from 'react-router-dom';
import makeGetPerson from './makeGetPerson';

// this 👇 is the custom hook 🎉
function useCurrentPerson() {
  const dispatch = useDispatch();

  // it uses `useRouteMatch` from `react-router`...
  const match = useRouteMatch('/people/:id');
  const id = match ? match.params.id : null;
  const getPerson = id ? makeGetPerson(id) : null;

  // ...along with `useData` from resift to join values!
  const data = useData(getPerson);
  const status = useStatus(getPerson);

  // it does dispatching as well
  useEffect(() => {
    if (getPerson) {
      dispatch(getPerson());
    }
  }, [dispatch, getPerson]);

  return { data, status };
}

export default useCurrentPerson;
```

## Demo

<iframe src="https://codesandbox.io/embed/custom-hooks-43pkz?fontsize=14"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Custom Hooks"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

<br />
> ⚠️ Custom hooks are great… but, as with any abstraction, it's easy to get carried away.
>
> **[Be deliberate, when you create any abstractions](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction) aka [avoid hasty abstractions](https://kentcdodds.com/blog/aha-programming)!**
