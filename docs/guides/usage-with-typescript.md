---
id: usage-with-typescript
title: Usage with TypeScript
sidebar_label: Usage with TypeScript
---

We love TypeScript at Sift. We use it in our production apps and we care deeply about getting the developer experience of TypeScript right within ReSift.

Proper usage with TypeScript requires that you type your [fetch factories](../main-concepts/whats-a-fetch.md#defining-a-fetch) and [data services](../main-concepts/what-are-data-services.md).

## Getting the types of the data services

When creating your data services, use the typing helper `ServicesFrom`, to get the type of the services from your services object.

```ts
import { createDataService, createHttpService, ServicesFrom } from 'resift';

const http = createHttpService(/* ... */);
const services = { http };

export type Services = ServicesFrom<typeof services>;

const dataService = createDataService({
  services,
  onError: e => {
    throw e;
  },
});

export default dataService;
```

You can then import this where you define your fetch factories.

## Settings the types of the fetch factories

In order to add the correct type to the fetch factories, you need to use the helper `typedFetchFactory`. This helper allows you to set a type for your fetch. This type will be used by the `useData` and the `Guard` components.

`makeUpdatePerson.ts`

```ts
import { defineFetch, typedFetchFactory } from 'resift';
import { Services } from './dataService'; // this was created from the above example

interface Person {
  id: string;
  name: string;
}

const makeUpdatePerson = defineFetch({
  displayName: 'Update Person',
  // add types like so 👇
  make: (personId: string) => ({
    // add types like so       👇
    request: (updatedPerson: Person) => ({ http }: Services) =>
      http({
        method: 'GET',
        route: `/people/${personId}`,
      }),
  }),
});

// then export with `typedFetchFactory` with the type of the data
//                                 👇
export default typedFetchFactory<Person>()(makeUpdatePerson);
```

This fetch factory asserts that the shape of the data is the shape of the `Person`.

When you go to use this fetch factory, it should just work.

```tsx
import React from 'react';

import makeGetPerson from './makeGetPerson';
import makeUpdatePerson from './makeUpdatePerson';
import getPersonFromEvent from './getPersonFromEvent';

interface Props {
  id: string;
}

function Component({ id }: Props) {
  // typescript will enforce that this arg is a string
  //                                    👇
  const updatePerson = makeUpdatePerson(id);
  const getPerson = makeUpdatePerson(id);

  const handleUpdate = (e: React.FormEvent<unknown>) => {
    const person = getPersonFromEvent(e);

    // typescript will enforce that this is the correct type
    //                      👇
    dispatch(updatePerson(person));
  };

  // typescript will type this as `Person | null`
  const person = useData(getPerson);

  return (
    <Guard fetch={getPerson}>
      {person => {
        // 👆 typescript knows the shape of this
        return person.name;
      }}
    </Guard>
  );
}

export default Component;
```
