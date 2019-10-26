import React, { useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import useFetch from './useFetch';
import ResiftProvider from '../ResiftProvider';
import useDispatch from '../useDispatch';
import createDataService from '../createDataService';
import defineFetch from '../defineFetch';
import isNormal from '../isNormal';
import DeferredPromise from '../DeferredPromise';

test('it groups together useStatus and useData', async () => {
  const done = new DeferredPromise();

  const dataService = createDataService({
    services: {},
    onError: e => {
      throw e;
    },
  });

  const makeGetThing = defineFetch({
    displayName: 'Get Thing',
    make: () => ({
      request: () => () => ({ hello: 'world' }),
    }),
  });
  const getThing = makeGetThing();

  const statusHandler = jest.fn();
  const dataHandler = jest.fn();

  function ExampleComponent() {
    const dispatch = useDispatch();

    const [data, status] = useFetch(getThing);

    useEffect(() => {
      statusHandler(status);
      if (isNormal(status)) {
        done.resolve();
      }
    }, [status]);

    useEffect(() => {
      dataHandler(data);
    }, [data]);

    useEffect(() => {
      dispatch(getThing());
    }, [dispatch]);

    return null;
  }

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <ExampleComponent />
      </ResiftProvider>,
    );
    await done;
  });

  expect(dataHandler.mock.calls.map(args => args[0])).toMatchInlineSnapshot(`
    Array [
      null,
      Object {
        "hello": "world",
      },
    ]
  `);
  expect(statusHandler.mock.calls.map(args => args[0])).toMatchInlineSnapshot(`
    Array [
      0,
      2,
      1,
    ]
  `);
});
