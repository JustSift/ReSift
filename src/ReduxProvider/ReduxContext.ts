import React from 'react';
import { Store } from 'redux';

export default React.createContext<null | Store<any>>(null);
