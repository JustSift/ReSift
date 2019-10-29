---
id: usage-with-redux
title: Usage with Redux
sidebar_label: Usage with Redux
---

> The installation is a bit different if you're already using Redux. **Please only follow this guide if you're already using Redux.** If you're not please follow the [normal installation](../introduction/installation.md).
>
> We'll most likely be moving away from a Redux implementation. [See here.](https://github.com/JustSift/ReSift/issues/32)

Create the data service as you normally…

```js
import { createDataService } from 'resift';

const dataService = createDataService(/* ... */);

export default dataService;
```

…but instead of adding in the ReSift provider, add the data service as a middleware.

```js
import { createStore, applyMiddleware } from 'redux';
import dataService from './dataService';
import rootReducer from './rootReducer';

const store = createStore(rootReducer, {}, applyMiddleware(dataService));
```

Lastly, add the root reducer `dataService` from `dataServiceReducer`:

```js
import { dataServiceReducer } from 'resift';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  // ...
  dataService: dataServiceReducer,
  // ...
});

export default rootReducer;
```

That's it!
