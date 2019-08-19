import { FetchAction, FetchActionMeta } from '../defineFetch';
import { SuccessAction, ErrorAction } from '../createDataService';
import { ClearFetchAction } from '../clearFetch';

type ResiftAction = SuccessAction | ErrorAction | FetchAction | ClearFetchAction;

export interface ActionState {
  shared: boolean;
  inflight?: Function;
  payload: unknown;
  hadSuccess?: boolean;
  error?: boolean;
  meta: FetchActionMeta;
  updatedAt: string;
}

export interface ActionsState {
  [storeKey: string]: {
    [key: string]: ActionState | null;
  };
}

export default function actionsReducer(state: ActionsState, action: ResiftAction): ActionsState;
