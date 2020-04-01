import React, { useEffect } from 'react';
import { create, act } from 'react-test-renderer';
import DeferredPromise from './DeferredPromise';
import {
  ResiftProvider,
  defineFetch,
  useData,
  useStatus,
  createDataService,
  useDispatch,
  isLoading,
  isNormal,
} from './index';

test('basic lifecycle', async () => {
  const finishedRendering = new DeferredPromise();
  const dataHandler = jest.fn();
  const statusHandler = jest.fn();

  const makePersonFetch = defineFetch({
    displayName: 'Get Person',
    make: (personId) => ({
      request: () => () => ({
        personId,
        name: 'It worked!',
      }),
    }),
  });

  function Person({ personId }) {
    const dispatch = useDispatch();
    const personFetch = makePersonFetch(personId);
    const person = useData(personFetch);
    const status = useStatus(personFetch);

    useEffect(() => {
      dispatch(personFetch());
    }, [personFetch, dispatch]);

    useEffect(() => statusHandler(status), [status]);
    useEffect(() => dataHandler(person), [person]);

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

  expect(statusHandler).toHaveBeenCalledTimes(3);
  // 1) first render
  // 2) loading
  // 3) resolved/normal
  expect(statusHandler.mock.calls.map((x) => x[0])).toMatchInlineSnapshot(`
    Array [
      0,
      2,
      1,
    ]
  `);

  expect(dataHandler).toHaveBeenCalledTimes(2);
  // 1) no data
  // 2) data
  expect(dataHandler.mock.calls.map((x) => x[0])).toMatchInlineSnapshot(`
    Array [
      null,
      Object {
        "name": "It worked!",
        "personId": "person123",
      },
    ]
  `);
});
