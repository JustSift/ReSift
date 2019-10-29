---
id: usage-with-classes
title: Usage with classes
sidebar_label: Usage with classes
---

> Disclaimer: ReSift is meant to be used with function components because we use hooks to drive our APIs.
>
> However, we acknowledge that you can't rewrite you application. This guide is meant to show you how to use ReSift with you existing components for compatibility's sake. **If you're creating new experiences, we strongly advise you to use function components.**

In order to use ReSift's hooks with your existing class components, we recommend using the library [`hocify`](https://github.com/ricokahler/hocify) aka higher-order-component-ify.

This library lets you use hooks with function components by wrapping your hooks with an outer function component internally.

See this example:

```js
import { Component } from 'react';
import { useStatus, Guard } from 'resift';
import hocify from 'hocify';
import makeGetPerson from './makeGetPerson';

//                                    👇 these are incoming props
const withFetchAndStatus = hocify(({ personId }) => {
  const getPerson = makeGetPerson(personId);
  const status = useStatus(getPerson);

  // these will be injected as props
  //        👇
  return { getPerson, status };
});

class MyExistingComponent extends Component {
  render() {
    const { getPerson, status } = this.props;

    return (
      <div>
        {isLoading(status) && (
          <div className="overlay">
            <Spinner />
          </div>
        )}
        <Guard fetch={getPerson}>{person => <h1>{person.name}</h1>}</Guard>
      </div>
    );
  }
}

export default withFetchAndStatus(MyExistingComponent);
```
