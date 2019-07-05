import { Reducer } from 'redux';

export interface DataServiceState {
  shared: any;
  actions: any;
}

declare const dataServiceReducer: Reducer<DataServiceState>;

export default dataServiceReducer;
