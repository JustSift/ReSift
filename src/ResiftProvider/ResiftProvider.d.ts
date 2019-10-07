import React from 'react';

/**
 * @docs `ResiftProvider`
 *
 * The provider ReSift gives you that configures Redux for you.
 *
 * [More documentation coming soon](../TODO.md)
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
   * [See this doc for more info.](../TODO.md)
   */
  suppressOutsideReduxWarning?: boolean;
  children?: React.ReactNode;
}

export default ResiftProvider;
