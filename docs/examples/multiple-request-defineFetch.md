---
id: multiple-request-defineFetch
title: Using defineFetch for multiple fetches
sidebar_label: Multiple Fetches Example
---

# Multiple Request `defineFetch` Example

One case Resift shines is when multiple requests need to be fired under one loading state.

The use case below is an example for when series of people need to be deleted from a list.

Example:

```ts
// component/actions/peopleFetch.ts
import defineFetch from 'resift/defineFetch';

const makePeopleFetch = defineFetch({
  displayName: 'Get People',
  share: {
    namespace: 'people',
    merge: (previous, next) => {
      // Note: next will be the value that gets returned from the request payload

    }
  },
  make: () => ({
    key: [],
    request: () => ({ http }) =>
      return http({
        method: 'GET',
        route: `/people`,
      }),
  }),
});

export default makePeopleFetch();

```

```ts
// component/actions/deletePeopleFetch.ts
import defineFetch from 'resift/defineFetch';

const makeDeletePeople = defineFetch({
  displayName: 'Delete People',
  share: {
    namespace: 'people',
    merge: (previous, next) => {
      // Note: next will be  `peopleToDelete` because it was returned from the `request` function
      const people = previous;
      const peopleToDelete = next;

      return people.reduce((acc, person) => {
        const isDeleted = peopleToDelete.filter(p => p.id === person.id).length !== 0;
        return isDeleted ? acc : [...acc, person];
      }, []);
    },
  },
  make: () => ({
    key: [],
    request: (peopleToDelete: person[]) => async ({ http, dispatch }) => {
      const errors: Error[] = [];
      await Promise.all(
        peopleToDelete.map((id: string) => {
          return http({
            method: 'DELETE',
            route: `/person/${id}`,
          }).catch((err: Error) => {
            new Error(err);
          });
        }),
      );

      return peopleToDelete;
    },
  }),
});

export default makeDeletePeople();
```

```tsx
// Example container using `definefetch`s above
// - component/index.tsx

import React, { useEffect } from 'react';

// Required Resift tools
import useFetch from 'resift/useFetch';
import useDispatch from 'resift/useDispatch';

// Returned Component
import ProfileComponent from './Profile';

// Action in examples above
import peopleFetch from './actions/peopleFetch';
import deletePeopleFetch from './actions/deletePeopleFetch';

function ProfileFetcher() {
  const dispatch = useDispatch();

  // When component mounts the defineFetch's request function will fire.
  useEffect(() => {
    dispatch(peopleFetch());
  }, [dispatch, getPeople]);

  const handleDeletePeople = (peopleToDelete: person[]) => {
    dispatch(deletePeopleFetch(peopleToDelete));
  };

  // `useFetch` subscribes to changes made during the request phase of the dispatch above
  const [people, status] = useFetch(peopleFetch());

  return <ProfileComponent profileData={person} onDeletePeople={handleDeletePeople} />;
}

export default ProfileFetcher;
```
