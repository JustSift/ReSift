import matchPath from './matchPath';

describe('matchPath', () => {
  describe('without path property on params', () => {
    test("doesn't throw an exception", () => {
      expect(() => {
        matchPath('/milkyway/eridani', { hash: 'foo' });
      }).not.toThrow();
    });
  });

  describe('with path="/"', () => {
    test('returns correct url at "/"', () => {
      const path = '/';
      const pathname = '/';
      const match = matchPath(pathname, path);
      expect(match.url).toBe('/');
    });

    test('returns correct url at "/somewhere/else"', () => {
      const path = '/';
      const pathname = '/somewhere/else';
      const match = matchPath(pathname, path);
      expect(match.url).toBe('/');
    });
  });

  describe('with path="/somewhere"', () => {
    test('returns correct url at "/somewhere"', () => {
      const path = '/somewhere';
      const pathname = '/somewhere';
      const match = matchPath(pathname, path);
      expect(match.url).toBe('/somewhere');
    });

    test('returns correct url at "/somewhere/else"', () => {
      const path = '/somewhere';
      const pathname = '/somewhere/else';
      const match = matchPath(pathname, path);
      expect(match.url).toBe('/somewhere');
    });
  });

  describe('with an array of paths', () => {
    test('accepts an array as 2nd argument', () => {
      const path = ['/somewhere', '/elsewhere'];
      const pathname = '/elsewhere';
      const match = matchPath(pathname, path);
      expect(match.url).toBe('/elsewhere');
    });

    test('return the correct url at "/elsewhere"', () => {
      const path = ['/somewhere', '/elsewhere'];
      const pathname = '/elsewhere';
      const match = matchPath(pathname, { path });
      expect(match.url).toBe('/elsewhere');
    });

    test('returns correct url at "/elsewhere/else"', () => {
      const path = ['/somewhere', '/elsewhere'];
      const pathname = '/elsewhere/else';
      const match = matchPath(pathname, { path });
      expect(match.url).toBe('/elsewhere');
    });

    test('returns correct url at "/elsewhere/else" with path "/" in array', () => {
      const path = ['/somewhere', '/'];
      const pathname = '/elsewhere/else';
      const match = matchPath(pathname, { path });
      expect(match.url).toBe('/');
    });

    test('returns correct url at "/somewhere" with path "/" in array', () => {
      const path = ['/somewhere', '/'];
      const pathname = '/somewhere';
      const match = matchPath(pathname, { path });
      expect(match.url).toBe('/somewhere');
    });
  });

  describe('with sensitive path', () => {
    test('returns non-sensitive url', () => {
      const options = {
        path: '/SomeWhere',
      };
      const pathname = '/somewhere';
      const match = matchPath(pathname, options);
      expect(match.url).toBe('/somewhere');
    });

    test('returns sensitive url', () => {
      const options = {
        path: '/SomeWhere',
        sensitive: true,
      };
      const pathname = '/somewhere';
      const match = matchPath(pathname, options);
      expect(match).toBe(null);
    });
  });

  describe('cache', () => {
    test.skip('creates a cache entry for each exact/strict pair', () => {
      // true/false and false/true will collide when adding booleans
      const trueFalse = matchPath('/one/two', {
        path: '/one/two/',
        exact: true,
        strict: false,
      });
      const falseTrue = matchPath('/one/two', {
        path: '/one/two/',
        exact: false,
        strict: true,
      });
      expect(!!trueFalse).toBe(true);
      expect(!!falseTrue).toBe(false);
    });
  });
});
