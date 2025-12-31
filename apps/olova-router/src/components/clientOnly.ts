import type { ComponentType } from 'react';

export interface LoaderContext {
  params: Record<string, string>;
  searchParams: URLSearchParams;
  signal: AbortSignal;
}

export interface ActionContext {
  params: Record<string, string>;
  request: Request;
}

export type LoaderFunction<T = unknown> = (context: LoaderContext) => Promise<T> | T;

export type ActionFunction<T = unknown> = (context: ActionContext) => Promise<T> | T;

// Retry configuration for failed loaders
export interface RetryConfig {
  maxRetries?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
}

// Garbage collection configuration
export interface GcConfig {
  /** Time in ms after which unused cache entries are removed. Default: 5 minutes */
  gcTime?: number;
}

export interface ClientOnlyOptions<TLoader = unknown, TAction = unknown, TParams = Record<string, string>> {
  /** Loader function that runs before the component renders */
  loader?: LoaderFunction<TLoader>;

  /** Action function for form submissions */
  action?: ActionFunction<TAction>;

  /** Enable prefetching on link hover. Default: false */
  preload?: boolean;

  /** Component to show while loader is running */
  pendingComponent?: ComponentType;

  /** Component to show when loader fails */
  errorComponent?: ComponentType<{ error: Error; retry: () => void }>;

  /** 
   * Time in ms that data is considered fresh. 
   * While fresh, cached data is used without refetching.
   * After staleTime, data is shown while refetching in background (SWR).
   * Default: 0 (always refetch)
   */
  staleTime?: number;

  /** 
   * Time in ms after which unused cache entries are garbage collected.
   * Default: 5 minutes (300000)
   */
  gcTime?: number;

  /** Validate route params before running loader */
  validateParams?: (params: Record<string, string>) => TParams;

  /** Guard that runs before loader. Return false to prevent navigation */
  beforeEnter?: (context: LoaderContext) => boolean | Promise<boolean>;

  /** Retry configuration for failed loaders */
  retry?: RetryConfig;

  /** 
   * Whether to refetch when window regains focus.
   * Default: false
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Whether to refetch when reconnecting to network.
   * Default: false
   */
  refetchOnReconnect?: boolean;

  /**
   * Interval in ms to automatically refetch data.
   * Default: undefined (no polling)
   */
  refetchInterval?: number;

  /**
   * Whether to refetch on mount even if data is cached.
   * Default: false
   */
  refetchOnMount?: boolean;
}

export interface RouteDefinition<TLoader = unknown, TAction = unknown> {
  __isRouteDefinition: true;
  loader?: LoaderFunction<TLoader>;
  action?: ActionFunction<TAction>;
  preload: boolean;
  pendingComponent?: ComponentType;
  errorComponent?: ComponentType<{ error: Error; retry: () => void }>;
  staleTime: number;
  gcTime: number;
  validateParams?: (params: Record<string, string>) => unknown;
  beforeEnter?: (context: LoaderContext) => boolean | Promise<boolean>;
  retry?: RetryConfig;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
  refetchInterval?: number;
  refetchOnMount: boolean;
}

/**
 * Creates a client-side route configuration with powerful data loading capabilities.
 * 
 * @example
 * ```tsx
 * export const route = clientOnly({
 *   loader: async ({ params, searchParams, signal }) => {
 *     const res = await fetch(`/api/users/${params.id}`, { signal });
 *     return res.json();
 *   },
 *   staleTime: 30000, // 30 seconds
 *   pendingComponent: () => <Skeleton />,
 *   errorComponent: ({ error, retry }) => (
 *     <div>
 *       <p>Error: {error.message}</p>
 *       <button onClick={retry}>Retry</button>
 *     </div>
 *   ),
 * });
 * ```
 */
export function clientOnly<TLoader = unknown, TAction = unknown, TParams = Record<string, string>>(
  options: ClientOnlyOptions<TLoader, TAction, TParams>
): RouteDefinition<TLoader, TAction> {
  return {
    __isRouteDefinition: true,
    loader: options.loader,
    action: options.action,
    preload: options.preload ?? false,
    pendingComponent: options.pendingComponent,
    errorComponent: options.errorComponent,
    staleTime: options.staleTime ?? 0,
    gcTime: options.gcTime ?? 300000, // 5 minutes default
    validateParams: options.validateParams,
    beforeEnter: options.beforeEnter,
    retry: options.retry,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options.refetchOnReconnect ?? false,
    refetchInterval: options.refetchInterval,
    refetchOnMount: options.refetchOnMount ?? false,
  };
}
