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
    request: (thing: Bar) => ({  }: /* services go here */ any) => exampleResult,
  }),
});

interface MyType {
  foo: string;
}

const blah = typedFetchFactory<MyType>()(fetchFactory);

console.log(fetchFactory);
