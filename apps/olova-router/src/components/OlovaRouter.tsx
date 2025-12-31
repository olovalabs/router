import { useState, useEffect, useMemo, useCallback, lazy, Suspense, type ReactNode, type ComponentType } from 'react';
import { RouterContext, OutletContext } from './context';
import { parseSearchParams, buildSearchString } from './search-params';
import { matchRoute, matchLayoutScope, findNotFoundPage } from './matching';
import { RouteWithLoader, prefetch as prefetchData } from './RouteWithLoader';
import type { Route, LayoutRoute, NotFoundPageConfig, SearchParams, SetSearchParamsOptions, Metadata, RouteDefinition } from '../types';

interface OlovaRouterProps {
  routes: Route[];
  layouts?: LayoutRoute[];
  notFoundPages?: NotFoundPageConfig[];
  notFound?: ReactNode;
  loadingFallback?: ReactNode;
}

export function OlovaRouter({
  routes,
  layouts = [],
  notFoundPages = [],
  notFound = <div>404 - Not Found</div>,
  loadingFallback = <div>Loading...</div>
}: OlovaRouterProps) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchParams, setSearchParamsState] = useState<SearchParams>(() =>
    parseSearchParams(window.location.search)
  );

  // Store the default title on initial mount
  const [defaultTitle] = useState(() => document.title);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParamsState(parseSearchParams(window.location.search));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    setSearchParamsState(parseSearchParams(path.includes('?') ? path.split('?')[1] : ''));
  };

  const push = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    setSearchParamsState(parseSearchParams(path.includes('?') ? path.split('?')[1] : ''));
  };

  const replace = (path: string) => {
    window.history.replaceState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    setSearchParamsState(parseSearchParams(path.includes('?') ? path.split('?')[1] : ''));
  };

  const setSearchParams = (
    newParams: Record<string, string | string[] | null>,
    options: SetSearchParamsOptions = {}
  ) => {
    const { replace: shouldReplace = false, merge = false } = options;

    let finalParams: Record<string, string | string[] | null>;

    if (merge) {
      finalParams = { ...searchParams, ...newParams };
      for (const key of Object.keys(finalParams)) {
        if (finalParams[key] === null) {
          delete finalParams[key];
        }
      }
    } else {
      finalParams = newParams;
    }

    const searchString = buildSearchString(finalParams as Record<string, string | string[] | null>);
    const newUrl = currentPath + searchString;

    if (shouldReplace) {
      window.history.replaceState({}, '', newUrl);
    } else {
      window.history.pushState({}, '', newUrl);
    }

    setSearchParamsState(parseSearchParams(searchString));
  };

  const sortedRoutes = useMemo(() => {
    return [...routes].sort((a, b) => {
      const aHasCatchAll = a.path.includes('*');
      const bHasCatchAll = b.path.includes('*');
      const aHasDynamic = a.path.includes(':');
      const bHasDynamic = b.path.includes(':');

      if (aHasCatchAll && !bHasCatchAll) return 1;
      if (!aHasCatchAll && bHasCatchAll) return -1;
      if (aHasDynamic && !bHasDynamic) return 1;
      if (!aHasDynamic && bHasDynamic) return -1;
      return b.path.length - a.path.length;
    });
  }, [routes]);

  // Memoized function to apply metadata to document
  const applyMetadata = useCallback((metadata: Metadata | undefined) => {
    if (metadata?.title) {
      document.title = metadata.title;
    } else {
      document.title = defaultTitle;
    }

    let descMeta = document.querySelector('meta[name="description"]');
    if (metadata?.description) {
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', metadata.description);
    } else if (descMeta) {
      document.head.removeChild(descMeta);
    }

    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (metadata?.keywords) {
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute('content', Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : metadata.keywords);
    } else if (keywordsMeta) {
      document.head.removeChild(keywordsMeta);
    }
  }, [defaultTitle]);

  const { currentRoute, MatchedComponent, matchedRouteDefinition, params } = useMemo(() => {
    for (const route of sortedRoutes) {
      if (route.path === '/' && currentPath === '/') {
        return {
          currentRoute: route,
          MatchedComponent: route.component || null,
          matchedRouteDefinition: route.routeDefinition,
          params: {} as Record<string, string>
        };
      }
      const result = matchRoute(route.path, currentPath);
      if (result.match) {
        return {
          currentRoute: route,
          MatchedComponent: route.component || null,
          matchedRouteDefinition: route.routeDefinition,
          params: result.params
        };
      }
    }
    return {
      currentRoute: null as Route | null,
      MatchedComponent: null as ComponentType | null,
      matchedRouteDefinition: undefined as RouteDefinition | undefined,
      params: {} as Record<string, string>
    };
  }, [sortedRoutes, currentPath]);

  const prefetch = useCallback((path: string) => {
    let targetRoute: Route | null = null;
    let targetParams: Record<string, string> = {};
    const pathname = path.split('?')[0];

    for (const route of sortedRoutes) {
      if (route.path === '/' && pathname === '/') {
        targetRoute = route;
        targetParams = {};
        break;
      }
      const result = matchRoute(route.path, pathname);
      if (result.match) {
        targetRoute = route;
        targetParams = result.params;
        break;
      }
    }

    if (targetRoute?.routeDefinition?.loader && targetRoute.routeDefinition.preload) {
      const searchStr = path.includes('?') ? path.split('?')[1] : '';
      const searchParams = new URLSearchParams(searchStr);
      prefetchData(pathname, targetRoute.routeDefinition.loader, {
        params: targetParams,
        searchParams
      });
    }
  }, [sortedRoutes]);

  useEffect(() => {
    if (!currentRoute?.loader) {
      applyMetadata(currentRoute?.metadata);
    }
  }, [currentRoute, applyMetadata]);

  const matchingLayouts = useMemo(() => {
    return layouts
      .filter(layout => matchLayoutScope(layout.path, currentPath))
      .sort((a, b) => a.path.length - b.path.length);
  }, [layouts, currentPath]);

  const searchParamsForLoader = useMemo(() => {
    const urlParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => urlParams.append(key, v));
      } else {
        urlParams.set(key, value);
      }
    });
    return urlParams;
  }, [searchParams]);

  // Helper component to apply metadata after lazy load
  const LazyMetadataWrapper = useMemo(() => {
    if (!currentRoute?.loader) return null;
    
    const applyMeta = applyMetadata;
    return lazy(async () => {
      const mod = await currentRoute.loader!();
      const Component = mod.default;
      const metadata = mod.metadata;
      
      // Return a wrapper that will apply metadata on mount
      return {
        default: function LazyRouteWithMetadata(props: Record<string, unknown>) {
          useEffect(() => {
            applyMeta(metadata);
          }, []);
          return <Component {...props} />;
        }
      };
    });
  }, [currentRoute, applyMetadata]);

  // Compute final component including 404 fallback
  const FinalComponent = useMemo(() => {
    if (MatchedComponent) return MatchedComponent;
    if (!LazyMetadataWrapper) {
      return findNotFoundPage(currentPath, notFoundPages);
    }
    return null;
  }, [MatchedComponent, LazyMetadataWrapper, currentPath, notFoundPages]);

  const renderContent = () => {
    let content: ReactNode = notFound;

    if (LazyMetadataWrapper) {
       content = (
         <Suspense fallback={loadingFallback}>
           <LazyMetadataWrapper />
         </Suspense>
       );
    } else if (FinalComponent && matchedRouteDefinition?.loader) {
       // Route has a clientOnly loader - use RouteWithLoader
       content = (
         <RouteWithLoader
           component={FinalComponent}
           routeDefinition={matchedRouteDefinition}
           params={params}
           searchParams={searchParamsForLoader}
           loadingFallback={loadingFallback}
           pathname={currentPath}
         />
       );
    } else if (FinalComponent) {
       content = <FinalComponent />;
    }

    if (matchingLayouts.length === 0) {
      return content;
    }

    let result = content;
    for (let i = matchingLayouts.length - 1; i >= 0; i--) {
      const Layout = matchingLayouts[i].layout;
      if (!Layout) continue; // Skip if layout component doesn't exist
      const wrapped = result;
      result = (
        <OutletContext.Provider value={{ content: wrapped }}>
          <Layout />
        </OutletContext.Provider>
      );
    }
    return result;
  };

  return (
    <RouterContext.Provider value={{ currentPath, params, searchParams, navigate, push, replace, setSearchParams, prefetch }}>
      {renderContent()}
    </RouterContext.Provider>
  );
}
