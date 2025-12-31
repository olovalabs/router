import { 
  useState, 
  useEffect, 
  useCallback, 
  useRef,
  useMemo,
  createContext,
  useContext,
  Suspense,
  type ReactNode, 
  type ComponentType 
} from 'react';
import { LoaderDataContext, ActionDataContext, type LoaderDataContextType, type ActionDataContextType } from './loaderContext';
import type { RouteDefinition, LoaderContext, ActionContext } from '../types';

// ============================================
// CACHE SYSTEM - Stale-While-Revalidate
// ============================================

interface CacheEntry {
  data: unknown;
  timestamp: number;
  promise?: Promise<unknown>;
}

const loaderCache = new Map<string, CacheEntry>();

function getCacheKey(path: string, params: Record<string, string>, searchParams: URLSearchParams): string {
  const paramStr = JSON.stringify(params);
  const searchStr = searchParams.toString();
  return `${path}:${paramStr}:${searchStr}`;
}

// ============================================
// DEFERRED DATA SYSTEM
// ============================================

export interface DeferredData<T> {
  __deferred: true;
  promise: Promise<T>;
}

export function defer<T>(promise: Promise<T>): DeferredData<T> {
  return {
    __deferred: true,
    promise,
  };
}

function isDeferred(value: unknown): value is DeferredData<unknown> {
  return typeof value === 'object' && value !== null && '__deferred' in value;
}

// Await Component for rendering deferred data
interface AwaitProps<T> {
  resolve: DeferredData<T> | T;
  fallback?: ReactNode;
  errorElement?: ReactNode | ((error: Error) => ReactNode);
  children: (data: T) => ReactNode;
}

export function Await<T>({ resolve, fallback, errorElement, children }: AwaitProps<T>) {
  if (!isDeferred(resolve)) {
    // Not deferred, render immediately
    return <>{children(resolve)}</>;
  }

  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <AwaitInner promise={resolve.promise} errorElement={errorElement}>
        {children}
      </AwaitInner>
    </Suspense>
  );
}

interface SuspensePromise<T> extends Promise<T> {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
}

function AwaitInner<T>({ 
  promise: rawPromise, 
  errorElement,
  children 
}: { 
  promise: Promise<T>; 
  errorElement?: ReactNode | ((error: Error) => ReactNode);
  children: (data: T) => ReactNode;
}) {
  const promise = rawPromise as SuspensePromise<T>;

  if (promise.status === 'fulfilled') {
    return <>{children(promise.value as T)}</>;
  } else if (promise.status === 'rejected') {
    if (errorElement) {
      return <>{typeof errorElement === 'function' ? errorElement(promise.reason) : errorElement}</>;
    }
    throw promise.reason;
  } else if (promise.status === 'pending') {
    throw promise;
  } else {
    promise.status = 'pending';
    promise.then(
      result => {
        promise.status = 'fulfilled';
        promise.value = result;
      },
      reason => {
        promise.status = 'rejected';
        promise.reason = reason;
      }
    );
    throw promise;
  }
}

// ============================================
// ROUTE CONTEXT SYSTEM
// ============================================

export interface RouteContext {
  params: Record<string, string>;
  searchParams: URLSearchParams;
  loaderData: unknown;
  pathname: string;
}

const RouteDataContext = createContext<RouteContext | null>(null);

export function useRouteContext(): RouteContext {
  const context = useContext(RouteDataContext);
  if (!context) {
    throw new Error('useRouteContext must be used within a route');
  }
  return context;
}

// ============================================
// INVALIDATION SYSTEM
// ============================================

type InvalidateCallback = () => void;
const invalidateCallbacks = new Set<InvalidateCallback>();

export function invalidateLoader(pathPattern?: string): void {
  if (pathPattern) {
    // Clear specific cache entries matching pattern
    for (const key of loaderCache.keys()) {
      if (key.startsWith(pathPattern)) {
        loaderCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    loaderCache.clear();
  }
  // Trigger re-fetch for all active loaders
  invalidateCallbacks.forEach(cb => cb());
}

export function invalidateAll(): void {
  invalidateLoader();
}

// Hook for components to trigger invalidation
export function useInvalidate() {
  return {
    invalidate: invalidateLoader,
    invalidateAll,
  };
}

// ============================================
// PREFETCH SYSTEM
// ============================================

const prefetchPromises = new Map<string, Promise<unknown>>();

export function prefetch(
  path: string, 
  loader: (context: LoaderContext) => Promise<unknown> | unknown,
  options?: { params?: Record<string, string>; searchParams?: URLSearchParams }
): void {
  const params = options?.params || {};
  const searchParams = options?.searchParams || new URLSearchParams();
  const cacheKey = getCacheKey(path, params, searchParams);
  
  // Don't prefetch if already cached or prefetching
  if (loaderCache.has(cacheKey) || prefetchPromises.has(cacheKey)) {
    return;
  }

  const controller = new AbortController();
  const loaderContext: LoaderContext = {
    params,
    searchParams,
    signal: controller.signal,
  };

  const promise = Promise.resolve(loader(loaderContext)).then(data => {
    loaderCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
    prefetchPromises.delete(cacheKey);
    return data;
  }).catch(() => {
    prefetchPromises.delete(cacheKey);
  });

  prefetchPromises.set(cacheKey, promise);
}

// ============================================
// MAIN COMPONENT
// ============================================

interface RouteWithLoaderProps {
  component: ComponentType;
  routeDefinition: RouteDefinition;
  params: Record<string, string>;
  searchParams: URLSearchParams;
  loadingFallback: ReactNode;
  pathname?: string;
}

export function RouteWithLoader({
  component: Component,
  routeDefinition,
  params,
  searchParams,
  loadingFallback,
  pathname = window.location.pathname,
}: RouteWithLoaderProps) {
  const [loaderData, setLoaderData] = useState<unknown>(null);
  const [loaderError, setLoaderError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!!routeDefinition.loader);
  const [isRevalidating, setIsRevalidating] = useState(false);

  const [actionData, setActionData] = useState<unknown>(undefined);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Generate cache key
  const cacheKey = useMemo(() => 
    getCacheKey(pathname, params, searchParams), 
    [pathname, params, searchParams]
  );

  const staleTime = routeDefinition.staleTime ?? 0;

  const runLoader = useCallback((forceRefresh = false) => {
    if (!routeDefinition.loader) return () => {};

    // Check cache first (Stale-While-Revalidate)
    const cached = loaderCache.get(cacheKey);
    const now = Date.now();
    const isStale = cached && (now - cached.timestamp > staleTime);
    const isFresh = cached && !isStale;

    // If we have fresh cached data and not forcing refresh, use it
    if (isFresh && !forceRefresh) {
      setLoaderData(cached.data);
      setIsLoading(false);
      return () => {};
    }

    // If we have stale data, show it while revalidating
    if (cached && isStale && !forceRefresh) {
      setLoaderData(cached.data);
      setIsLoading(false);
      setIsRevalidating(true);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const loaderContext: LoaderContext = {
      params,
      searchParams,
      signal: controller.signal,
    };

    const execute = async () => {
      try {
        if (!cached) {
          setIsLoading(true);
        }
        setLoaderError(null);

        // Run beforeEnter guard
        if (routeDefinition.beforeEnter) {
          const canEnter = await routeDefinition.beforeEnter(loaderContext);
          if (!canEnter) {
            if (mountedRef.current) {
              setIsLoading(false);
              setIsRevalidating(false);
            }
            return;
          }
        }

        // Validate params if validator provided
        if (routeDefinition.validateParams) {
          routeDefinition.validateParams(params);
        }

        const data = await routeDefinition.loader!(loaderContext);
        
        if (mountedRef.current && !controller.signal.aborted) {
          // Update cache
          loaderCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          });
          setLoaderData(data);
          setLoaderError(null);
        }
      } catch (err) {
        if (mountedRef.current && !controller.signal.aborted) {
          setLoaderError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mountedRef.current && !controller.signal.aborted) {
          setIsLoading(false);
          setIsRevalidating(false);
        }
      }
    };

    execute();

    return () => {
      controller.abort();
    };
  }, [routeDefinition, params, searchParams, cacheKey, staleTime]);

  // Register for invalidation callbacks
  useEffect(() => {
    const callback = () => runLoader(true);
    invalidateCallbacks.add(callback);
    return () => {
      invalidateCallbacks.delete(callback);
    };
  }, [runLoader]);

  useEffect(() => {
    mountedRef.current = true;
    const cleanup = runLoader();
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [runLoader]);

  // Refetch on window focus
  useEffect(() => {
    if (!routeDefinition.refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        runLoader(true);
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [routeDefinition.refetchOnWindowFocus, runLoader]);

  // Refetch on reconnect
  useEffect(() => {
    if (!routeDefinition.refetchOnReconnect) return;

    const handleOnline = () => {
      runLoader(true);
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [routeDefinition.refetchOnReconnect, runLoader]);

  // Polling interval
  useEffect(() => {
    if (!routeDefinition.refetchInterval) return;

    const interval = setInterval(() => {
      runLoader(true);
    }, routeDefinition.refetchInterval);

    return () => {
      clearInterval(interval);
    };
  }, [routeDefinition.refetchInterval, runLoader]);

  const submitAction = useCallback(async (formData: FormData | Record<string, unknown>) => {
    if (!routeDefinition.action) return;

    const isFormData = formData instanceof FormData;
    const request = new Request(window.location.href, {
      method: 'POST',
      body: isFormData ? formData : JSON.stringify(formData),
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    });

    const actionContext: ActionContext = {
      params,
      request,
    };

    try {
      setIsSubmitting(true);
      setActionError(null);
      const data = await routeDefinition.action(actionContext);
      setActionData(data);

      // Invalidate cache and refetch after action
      loaderCache.delete(cacheKey);
      runLoader(true);
    } catch (err) {
      setActionError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsSubmitting(false);
    }
  }, [routeDefinition, params, runLoader, cacheKey]);

  const retry = useCallback(() => {
    loaderCache.delete(cacheKey);
    runLoader(true);
  }, [runLoader, cacheKey]);

  const revalidate = useCallback(() => {
    runLoader(true);
  }, [runLoader]);

  // Show pending component during initial load
  if (isLoading && routeDefinition.pendingComponent) {
    const PendingComponent = routeDefinition.pendingComponent;
    return <PendingComponent />;
  }

  // Show loading fallback if no pending component defined
  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  // Show error component on error
  if (loaderError && routeDefinition.errorComponent) {
    const ErrorComponent = routeDefinition.errorComponent;
    return <ErrorComponent error={loaderError} retry={retry} />;
  }

  // Create context values
  const loaderContextValue: LoaderDataContextType = {
    data: loaderData,
    isLoading,
    error: loaderError,
  };

  const actionContextValue: ActionDataContextType = {
    data: actionData,
    isSubmitting,
    error: actionError,
    submit: submitAction,
  };

  const routeContextValue: RouteContext = {
    params,
    searchParams,
    loaderData,
    pathname,
  };

  // Render component with contexts
  return (
    <RouteDataContext.Provider value={routeContextValue}>
      <LoaderDataContext.Provider value={loaderContextValue}>
        <ActionDataContext.Provider value={actionContextValue}>
          <Component />
          {/* Show revalidating indicator */}
          {isRevalidating && (
            <div 
              style={{
                position: 'fixed',
                top: 8,
                right: 8,
                padding: '4px 8px',
                background: 'rgba(59, 130, 246, 0.9)',
                color: 'white',
                borderRadius: 4,
                fontSize: 12,
                zIndex: 9999,
              }}
            >
              Updating...
            </div>
          )}
        </ActionDataContext.Provider>
      </LoaderDataContext.Provider>
    </RouteDataContext.Provider>
  );
}

// ============================================
// ADDITIONAL HOOKS
// ============================================

export function useRevalidate(): () => void {
  const context = useContext(RouteDataContext);
  if (!context) {
    throw new Error('useRevalidate must be used within a route');
  }
  
  return useCallback(() => {
    invalidateLoader(context.pathname);
  }, [context.pathname]);
}

export function useIsRevalidating(): boolean {
  // This would need to be connected to the actual revalidating state
  // For now return false - the indicator is shown in RouteWithLoader
  return false;
}
