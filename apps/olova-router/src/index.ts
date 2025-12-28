export type { OlovaRouterOptions, RouteEntry, RouteConfig, NotFoundEntry } from './types';

export { 
  OlovaRouter, 
  useRouter, 
  useParams, 
  useSearchParams, 
  createLink,
  Outlet,
  type NotFoundPageConfig,
  type SearchParams,
  type SetSearchParamsOptions,
  type LayoutRoute
} from './components';

import { olovaRouter } from './plugin';
export { olovaRouter } from './plugin';
export default olovaRouter;
