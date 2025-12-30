import { useState, useEffect, useMemo, type ReactNode, type ComponentType } from 'react';
import { RouterContext, OutletContext } from './context';
import { parseSearchParams, buildSearchString } from './search-params';
import { matchRoute, matchLayoutScope, findNotFoundPage } from './matching';
import type { Route, LayoutRoute, NotFoundPageConfig, SearchParams, SetSearchParamsOptions } from '../types';

interface OlovaRouterProps {
  routes: Route[];
  layouts?: LayoutRoute[];
  notFoundPages?: NotFoundPageConfig[];
  notFound?: ReactNode;
}

export function OlovaRouter({ routes, layouts = [], notFoundPages = [], notFound = <div>404 - Not Found</div> }: OlovaRouterProps) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchParams, setSearchParamsState] = useState<SearchParams>(() => 
    parseSearchParams(window.location.search)
  );

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

  // Store default title on mount
  const [defaultTitle] = useState(document.title);

  // Compute matched route for metadata
  const currentRoute = useMemo(() => {
    for (const route of sortedRoutes) {
      if (route.path === '/' && currentPath === '/') return route;
      const result = matchRoute(route.path, currentPath);
      if (result.match) return route;
    }
    return null;
  }, [sortedRoutes, currentPath]);

  // Update metadata
  useEffect(() => {
    const metadata = currentRoute?.metadata;

    // Handle Title
    if (metadata?.title) {
      document.title = metadata.title;
    } else {
      document.title = defaultTitle;
    }

    // Handle Description
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

    // Handle Keywords
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
  }, [currentRoute, defaultTitle]);

  const matchingLayouts = useMemo(() => {
    return layouts
      .filter(layout => matchLayoutScope(layout.path, currentPath))
      .sort((a, b) => a.path.length - b.path.length);
  }, [layouts, currentPath]);

  let MatchedComponent: ComponentType | null = null;
  let params: Record<string, string> = {};

  for (const route of sortedRoutes) {
    if (route.path === '/' && currentPath === '/') {
      MatchedComponent = route.component;
      break;
    }
    const result = matchRoute(route.path, currentPath);
    if (result.match) {
      MatchedComponent = route.component;
      params = result.params;
      break;
    }
  }

  if (!MatchedComponent) {
    const NotFoundComponent = findNotFoundPage(currentPath, notFoundPages);
    if (NotFoundComponent) {
      MatchedComponent = NotFoundComponent;
    }
  }

  const renderContent = () => {
    const content = MatchedComponent ? <MatchedComponent /> : notFound;
    
    if (matchingLayouts.length === 0) {
      return content;
    }

    let result = content;
    for (let i = matchingLayouts.length - 1; i >= 0; i--) {
      const Layout = matchingLayouts[i].layout;
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
    <RouterContext.Provider value={{ currentPath, params, searchParams, navigate, push, replace, setSearchParams }}>
      {renderContent()}
    </RouterContext.Provider>
  );
}
