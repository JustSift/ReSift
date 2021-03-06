import defineFetch, { typedFetchFactory } from './defineFetch';

const exampleResult = {
  thisIsAnExampleResult: 'blah',
};

interface Bar {
  bar: number;
}

const fetchFactory = defineFetch({
  displayName: 'example fetch',
  make: (foo: string, bar: number) => ({
    // eslint-disable-next-line no-empty-pattern
    request: (thing: Bar) => ({}: /* services go here */ any) => exampleResult,
  }),
});

interface MyType {
  foo: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const blah = typedFetchFactory<MyType>()(fetchFactory);

console.log(fetchFactory);
