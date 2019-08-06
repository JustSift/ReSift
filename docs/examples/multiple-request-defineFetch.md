# Multiple Request `defineFetch` Example

One case Resift shines is when multiple requests need to be fired under one loading state.

The use case below is an example for when series of people need to be deleted from a list.

Example:

```ts
// component/actions/getPeople.ts

import defineFetch from '@sift/resift/defineFetch';

export default defineFetch({
  displayName: 'Get People',
  make: () => ({
    key: [],
    request: () => ({ http }) =>
      return http({
        method: 'GET',
        route: `/people`,
      }),
  }),
});
```

```ts
// component/actions/deletePeople.ts
import makeGetPeople from './getPeople';
import defineFetch from '@sift/resift/defineFetch';

export default defineFetch({
  displayName: 'Delete People',
  make: () => ({
    key: [],
    request: (peopleToDelete: person[]) => async ({ http, dispatch }) => {
      const errors: Error[] = [];
      await Promise.all(
        peopleToDelete.map((id: string) => {
          return http({
            method: 'DELETE',
            route: `/person/${id}`
          }).catch((err: Error) => {
            errors.push(err);
          });
        })
      );

      // After completed, fetchPeople again.
      const getPeople = makeGetPeople();
      dispatch(getPeople());

      return errors.length ? errors : null;
    }
  })
});
```

```tsx
// Example container using `definefetch`s above
// - component/index.tsx

import React, { useEffect, useCallback } from 'react';

// Required Resift tools
import useFetch from '@sift/resift/useFetch';
import useDispatch from '@sift/resift/useDispatch';

// Returned Component
import ProfileComponent from './Profile';

// Action in example above
import makeGetPeople from './actions/getPeople';
import makeDeletePeople from './actions/deletePeople';

function Container() {
  const dispatch = useDispatch();

  // This builds the function used for dispatching requests and subscribing to changes.
  const getPeople = makeGetPeople();
  const deletePeople = makeDeletePeople();

  // When component mounts the defineFetch's request function will fire.
  useEffect(() => {
    dispatch(getPeople());
  }, []);

  const handleDeletePeople = useCallback(
    (peopleToDelete: person[]) => {
      dispatch(deletePeople(peopleToDelete));
    },
    [deletePeople]
  );

  // `useFetch` subscribes to changes made during the request phase of the dispatch above
  const [people, status] = useFetch(getPeople());

  return <ProfileComponent profileData={person} onDeletePeople={handleDeletePeople} />;
}

export default Container;
```
