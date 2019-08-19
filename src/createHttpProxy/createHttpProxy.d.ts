import { MatchParams, Match } from './matchPath';
import { HttpParams } from '../createHttpService';

export interface HttpProxy {
  matchParams: string | string[] | MatchParams;
  handler: HttpProxyHandler;
}

interface Http {
  (requestParams: HttpParams): Promise<void>;
}

interface HttpProxyHandler {
  (params: {
    match: Match;
    http: Http;
    requestParams: HttpParams;
    headers: any;
    prefix: string;
    onCancel: (subscriber: () => void) => void;
    getCanceled: () => boolean;
  }): any;
}

export default function createHttpProxy(
  matchParams: string | string[] | MatchParams,
  handler: HttpProxyHandler,
): HttpProxy;
