import React from 'react';
import defineFetch from '../defineFetch';
import createContextFetch from './createContextFetch';

// test with no merge result
() => {
  interface ExampleObject {
    foo: string;
  }

  const makeFetch = defineFetch({
    displayName: 'Get Example',
    make: (id: string) => ({
      key: [id],
      request: (x: number) => ({ http }) =>
        http({
          method: 'GET',
          route: '/test',
        }) as Promise<ExampleObject>,
    }),
  });

  const fetch = makeFetch('123');

  const { ContextFetchProvider, useContextFetch, ContextFetchConsumer } = createContextFetch(fetch);

  function Component() {
    const [value, status] = useContextFetch();

    // expected error: possible null
    value.foo;

    if (!value) {
      throw new Error();
    }

    const shouldBeAString = value.foo;
    shouldBeAString as string;

    // status should be a number
    status as number;

    <ContextFetchConsumer>
      {([value, status]) => {
        value.foo;
        status as number;

        return <div />;
      }}
    </ContextFetchConsumer>;

    return (
      <>
        {/* No child = expected typing error */}
        <ContextFetchProvider></ContextFetchProvider>

        {/* with child = it's all good */}
        <ContextFetchProvider>
          <div />
        </ContextFetchProvider>
      </>
    );
  }

  console.log(Component);
};
