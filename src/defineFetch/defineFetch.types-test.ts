import defineFetch from './defineFetch';

const exampleResult = {
  thisIsAnExampleResult: 'blah',
};

const actionCreatorFactory = defineFetch({
  displayName: 'example fetch',
  make: (foo: string, bar: number) => ({
    key: [foo, bar.toString()],
    request: () => ({  }: /* services go here */ any) => exampleResult,
  }),
});

console.log(actionCreatorFactory);
