import React, { useEffect } from 'react';
import { create, act } from 'react-test-renderer';
import DeferredPromise from './DeferredPromise';
import {
  ResiftProvider,
  defineFetch,
  useFetch,
  createDataService,
  useDispatch,
  isLoading,
  isNormal,
} from './index';

test('basic lifecycle', async () => {
  const finishedRendering = new DeferredPromise();
  const effectHandler = jest.fn();

  const makePersonFetch = defineFetch({
    displayName: 'Get Person',
    make: personId => ({
      request: () => () => ({
        personId,
        name: 'It worked!',
      }),
    }),
  });

  function Person({ personId }) {
    const dispatch = useDispatch();
    const personFetch = makePersonFetch(personId);
    const [person, status] = useFetch(personFetch);

    useEffect(() => {
      dispatch(personFetch());
    }, [personFetch, dispatch]);

    useEffect(() => effectHandler({ person, status }));

    useEffect(() => {
      if (!isNormal(status)) {
        return;
      }

      finishedRendering.resolve();
    }, [status]);

    return (
      <div>
        {person && person.name}
        {isLoading(status) && <div>Loading…</div>}
      </div>
    );
  }

  const handleError = jest.fn();

  const services = {};

  const dataService = createDataService({
    services,
    onError: handleError,
  });

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <Person personId="person123" />
      </ResiftProvider>,
    );

    await finishedRendering;
  });

  expect(effectHandler).toHaveBeenCalledTimes(3);

  // 1) first render
  // 2) loading
  // 3) resolved/normal
  expect(effectHandler.mock.calls.map(x => x[0])).toMatchInlineSnapshot(`
    Array [
      Object {
        "person": null,
        "status": 0,
      },
      Object {
        "person": undefined,
        "status": 2,
      },
      Object {
        "person": Object {
          "name": "It worked!",
          "personId": "person123",
        },
        "status": 1,
      },
    ]
  `);
});
