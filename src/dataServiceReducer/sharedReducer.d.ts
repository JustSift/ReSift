export interface SharedState {
  [cacheKey: string]: {
    data: any;
    parentActions: {
      [storePathHash: string]: { storeKey: string; key: string };
    };
  };
}

export default function sharedReducer(state: SharedState, action: any): SharedState;
