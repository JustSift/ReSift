import React from 'react';

/**
 * @docs `ResiftProvider`
 *
 * The provider ReSift gives you that configures Redux for you.
 *
 * See [Usage with Redux](../guides/usage-with-redux) for more info.
 */
declare const ResiftProvider: React.ComponentType<Props>;

/**
 * @docs `Props`
 */
interface Props {
  /**
   * Provide the data service created from [`createDataService`](./create-data-service.md)
   */
  dataService: any;
  /**
   * Use this option to suppress any warnings about external Redux contexts.
   */
  suppressOutsideReduxWarning?: boolean;
  children?: React.ReactNode;
}

export default ResiftProvider;
