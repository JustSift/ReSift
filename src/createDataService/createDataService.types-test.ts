import createHttpService from '../createHttpService';
import { ServicesFrom } from './createDataService';
import defineFetch from '../defineFetch';

const http = createHttpService({});

const services = { http };

type Services = ServicesFrom<typeof services>;

const makeGetThing = defineFetch({
  displayName: 'Get Thing',
  make: (id: string) => ({
    request: (stuff: number) => ({ http }: Services) =>
      http({
        method: 'GET',
        route: `/stuff/${id}`,
        query: { stuff: stuff.toString() },
      }),
  }),
});
