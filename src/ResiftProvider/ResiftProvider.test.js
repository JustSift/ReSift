import React, { useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import ResiftProvider from './ResiftProvider';
import useDispatch from '../useDispatch';
import DeferredPromise from '../DeferredPromise';
import createDataService from '../createDataService';

// see here...
// https://github.com/facebook/react/issues/11098#issuecomment-370614347
// ...for why these exist. not an ideal solution imo but it works
beforeEach(() => {
  jest.spyOn(console, 'error');
  global.console.error.mockImplementation(() => {});
});

afterEach(() => {
  global.console.error.mockRestore();
});

test('creates a redux store adding the data service middleware', async () => {
  const gotDispatch = new DeferredPromise();

  function ExampleComponent() {
    // using dispatch because it requires getting the store from context
    const dispatch = useDispatch();

    useEffect(() => {
      gotDispatch.resolve(dispatch);
    }, [dispatch]);

    return null;
  }

  const dataService = createDataService({
    services: {},
    onError: () => {},
  });

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <ExampleComponent />
      </ResiftProvider>,
    );

    await gotDispatch;
  });

  const dispatch = await gotDispatch;
  expect(typeof dispatch).toBe('function');
});

test('throws if there is no dataService key', async () => {
  const gotError = new DeferredPromise();
  class ErrorBoundary extends React.Component {
    componentDidCatch(e) {
      gotError.resolve(e);
    }

    render() {
      return this.props.children;
    }
  }

  await act(async () => {
    create(
      <ErrorBoundary>
        <ResiftProvider />
      </ErrorBoundary>,
    );
    await gotError;
  });

  const error = await gotError;
  expect(error.message).toMatchInlineSnapshot(
    `"[ResiftProvider] \`dataService\` missing from props."`,
  );
});
