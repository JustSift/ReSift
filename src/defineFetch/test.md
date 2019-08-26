API docs plan:

- if `@docs` is in the JS Doc comment, then include that block in the docs.
- each block will be included in the order they are included in the file
- if the block is an interface, it will be turned into a table
- if the block is a function, it will be put in the file as is, expect, the generic parameters will be omitted because they are probably noisy for non-ts users
- for separating types out, prefer to use `type`s for functions because it won't be turned into a table

```
interface DefineFetchParams {
  /**
   * this is a display name
   */
  displayName: string;

  /**
   * this is make.
   */
  make: (...keyArgs: KeyArgs) => {
    key: string[];
    request: (...fetchArgs: FetchArgs) => (services: any) => FetchResult;
  };

  /**
   * this is share
   */
  share?: ShareParams<MergeResult>;

  conflict?: 'cancel' | 'ignore';

  staticFetchFactoryId?: string;
}
```
