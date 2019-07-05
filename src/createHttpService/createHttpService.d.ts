import Superagent from 'superagent';
import { DataServiceParams } from '../createDataServiceMiddleware';

export interface HttpServiceParams {
  getHeaders: (() => any) | (() => Promise<any>);
  prefix?: string;
  getPrefix?: (() => string) | (() => Promise<string>);
}

export interface HttpParams {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  route: string;
  query?: { [key: string]: string };
  data?: any;
  /**
   * http://visionmedia.github.io/superagent/#error-handling
   *
   * > Alternatively, you can use the `.ok(callback)` method to decide whether a response is an
   * > error or not. The callback to the `ok` function gets a response and returns `true` if the
   * > response should be interpreted as success.
   * 
   * ```js
    request.get('/404')
      .ok(res => res.status < 500)
      .then(response => {
        // reads 404 page as a successful response
      });
  ```
   */
  ok?: (response: Superagent.Response) => boolean;
  /**
   * you can add custom behavior to the superagent req using this callback.
   * it is added before the `req.send` method is called
   */
  req?: (request: Superagent.SuperAgentRequest) => void;
}

export default function createHttpService(
  params: HttpServiceParams,
): (serviceParams: DataServiceParams) => (httpParams: HttpParams) => any;
