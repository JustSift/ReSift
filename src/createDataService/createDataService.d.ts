import { FetchActionMeta } from '../defineFetch';

export interface DataServiceMiddlewareParams {
  services: { [key: string]: DataService<any> };
  onError: (error: Error) => void;
}

export default function createDataService(params: DataServiceMiddlewareParams): any;

export interface DataServiceParams {
  onCancel: (callback: () => void) => void;
  getCancelled: () => boolean;
}

export interface DataService<T> {
  (params: DataServiceParams): T | Promise<T | undefined>;
}

export interface SuccessAction {
  type: string;
  meta: FetchActionMeta;
  payload: any;
}

export interface ErrorAction {
  type: string;
  meta: FetchActionMeta;
  payload: Error;
  error: true;
}
