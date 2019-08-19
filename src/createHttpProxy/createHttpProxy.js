/*
 * this function doesn't do anything more than wrap the params in an object
 * the reason this function exists is for a better library experience when the user is using an
 * editor that supports the typescript language service (e.g. vs-code, webstorm, visual studio)
 */
export default function createHttpProxy(matchParams, handler) {
  return { matchParams, handler };
}
