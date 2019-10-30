import { FetchInstance } from '../defineFetch';

declare function useData<FetchArgs extends any[], Data = any>(
  fetch: FetchInstance<FetchArgs, Data>,
): Data | null;

export default useData;
