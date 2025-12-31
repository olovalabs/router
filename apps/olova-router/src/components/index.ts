export { OlovaRouter } from './OlovaRouter';
export { Outlet } from './Outlet';
export { createLink, type ResolveRoutePath } from './Link';
export { useRouter, useParams, useSearchParams, usePathname } from './context';
export { clientOnly } from './clientOnly';
export {
  useLoaderData,
  useActionData,
  useIsLoading,
  useIsSubmitting,
  usePending,
  useLoaderError,
  useSubmit
} from './loaderContext';

// New powerful exports
export {
  defer,
  Await,
  prefetch,
  invalidateLoader,
  invalidateAll,
  useInvalidate,
  useRouteContext,
  useRevalidate,
} from './RouteWithLoader';

export type { DeferredData, RouteContext } from './RouteWithLoader';
export type { SearchParams, SetSearchParamsOptions, RouterContextType, OutletContextType, RouteDefinition, LoaderContext, ActionContext, LoaderFunction, ActionFunction } from '../types';
export type { NotFoundPageConfig, LayoutRoute, Route, Metadata } from '../types';
export type { ClientOnlyOptions, RetryConfig, GcConfig } from './clientOnly';
