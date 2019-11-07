import React from 'react';
import { FetchInstance } from '../defineFetch';

/**
 * @docs `Guard`
 *
 * The Guard component takes in a [fetch instance](./define-fetch.md) and a
 * [render prop](https://reactjs.org/docs/render-props.html). This component calls your render prop
 * with data when the data becomes available effectively guarding you against nullish data.
 */
declare function Guard<FetchArgs extends any[], Data = any>(
  props: Props<FetchArgs, Data>,
): JSX.Element;

/**
 * @docs Guard `Props`
 */
interface Props<FetchArgs extends any[], Data = any> {
  /**
   * the [fetch](../main-concepts/whats-a-fetch.md)
   */
  fetch: FetchInstance<FetchArgs, Data>;
  /**
   * a [render prop](https://reactjs.org/docs/render-props.html) that is invoked when there is data
   * available.
   */
  children: (data: Data) => JSX.Element;
}

export default Guard;
