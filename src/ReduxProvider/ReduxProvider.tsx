import React from 'react';
import { Store } from 'redux';

import ReduxContext from './ReduxContext';

export interface ReduxProviderProps {
  store: Store<any>;
  children: React.ReactNode;
}

export default function ReduxProvider({ store, children }: ReduxProviderProps) {
  return <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>;
}
