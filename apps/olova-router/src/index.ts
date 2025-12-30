export type { OlovaRouterOptions, RouteEntry, RouteConfig, NotFoundEntry } from './types';

export { 
  OlovaRouter, 
  useRouter, 
  useParams, 
  useSearchParams, 
  usePathname,
  createLink,
  Outlet,
  type NotFoundPageConfig,
  type SearchParams,
  type SetSearchParamsOptions,
  type LayoutRoute,
  type RouterContextType,
  type OutletContextType,
  type Metadata
} from './components';

import { olovaRouter } from './plugin';
export { olovaRouter } from './plugin';
export default olovaRouter;
