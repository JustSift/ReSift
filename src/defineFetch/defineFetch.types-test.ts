import defineFetch from './defineFetch';

const exampleResult = {
  thisIsAnExampleResult: 'blah',
};

const fetchFactory = defineFetch({
  displayName: 'example fetch',
  make: (foo: string, bar: number) => ({
    request: () => ({  }: /* services go here */ any) => exampleResult,
  }),
});

console.log(fetchFactory);
