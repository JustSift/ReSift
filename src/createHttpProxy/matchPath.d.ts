// typings adapted from the `react-router` typings
export interface MatchParams {
  path?: string | string[];
  exact?: boolean;
  sensitive?: boolean;
  strict?: boolean;
}

export interface Match {
  params: { [key: string]: string };
  isExact: boolean;
  path: string;
  url: string;
}

export default function matchPath<Params extends { [K in keyof Params]?: string }>(
  pathname: string,
  matchParams: string | string[] | MatchParams,
): Match | null;
