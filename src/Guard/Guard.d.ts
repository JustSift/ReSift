import React from 'react';
import { FetchInstance } from '../defineFetch';

interface Props<FetchArgs extends any[], Data = any> {
  fetch: FetchInstance<FetchArgs, Data>;
  children: (data: Data) => JSX.Element;
}

declare function Guard<FetchArgs extends any[], Data = any>(
  props: Props<FetchArgs, Data>,
): JSX.Element;

export default Guard;
