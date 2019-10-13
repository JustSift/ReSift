import React from 'react';
import { FetchActionCreator } from '../defineFetch';

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;

interface Props<FetchArgs extends any[] = any, FetchResult = any, MergeResult = any> {
  fetch: FetchActionCreator<FetchArgs, FetchResult, MergeResult>;
  children: (data: PickResult<FetchResult, MergeResult>) => JSX.Element;
  shouldShowWhen?: (status: number) => boolean;
}

declare function Guard<FetchArgs extends any[] = any, FetchResult = any, MergeResult = any>(
  props: Props<FetchArgs, FetchResult, MergeResult>,
): JSX.Element;

export default Guard;
