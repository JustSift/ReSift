import React, { useEffect } from 'react';
import { create, act } from 'react-test-renderer';
import useData from './useData';
import ResiftProvider from '../ResiftProvider';
import defineFetch from '../defineFetch';
import createDataService from '../createDataService';
import DeferredPromise from '../DeferredPromise';
import useDispatch from '../useDispatch';

test('unshared, it grabs data from the store', async () => {
  const done = new DeferredPromise();

  const makeGetMovie = defineFetch({
    displayName: 'Get Movie',
    make: movieId => ({
      request: () => () => ({ id: movieId, name: 'test movie' }),
    }),
  });
  const getMovie = makeGetMovie('movie123');

  const effectHandler = jest.fn();

  const dataService = createDataService({
    services: {},
    onError: e => {
      throw e;
    },
  });

  function ExampleComponent() {
    const dispatch = useDispatch();
    const movie = useData(getMovie);

    useEffect(() => {
      dispatch(getMovie());
    }, [dispatch]);

    useEffect(() => {
      effectHandler(movie);
      if (movie) {
        done.resolve(movie);
      }
    }, [movie]);

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

  const movie = await done;
  expect(effectHandler).toHaveBeenCalledTimes(2);
  expect(effectHandler.mock.calls[0][0]).toBe(null);
  expect(effectHandler.mock.calls[1][0]).toBe(movie);
});

test('shared: pulls data from the store', async () => {
  const done = new DeferredPromise();

  const makeGetMovie = defineFetch({
    displayName: 'Get Movie',
    share: { namespace: 'movie' },
    make: movieId => ({
      request: () => () => ({ id: movieId, name: 'test movie' }),
    }),
  });
  const getMovie = makeGetMovie('movie123');

  const effectHandler = jest.fn();

  const dataService = createDataService({
    services: {},
    onError: e => {
      throw e;
    },
  });

  function ExampleComponent() {
    const dispatch = useDispatch();
    const movie = useData(getMovie);

    useEffect(() => {
      dispatch(getMovie());
    }, [dispatch]);

    useEffect(() => {
      effectHandler(movie);
      if (movie) {
        done.resolve(movie);
      }
    }, [movie]);

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

  const movie = await done;
  expect(effectHandler).toHaveBeenCalledTimes(2);
  expect(effectHandler.mock.calls[0][0]).toBe(null);
  expect(effectHandler.mock.calls[1][0]).toBe(movie);
});
