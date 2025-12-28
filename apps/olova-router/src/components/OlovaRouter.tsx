import { useState, useEffect, useMemo, type ReactNode, type ComponentType } from 'react';
import { RouterContext, OutletContext } from './context';
import { parseSearchParams, buildSearchString, type SearchParams, type SetSearchParamsOptions } from './search-params';
import { matchRoute, matchLayoutScope, findNotFoundPage, type Route, type LayoutRoute, type NotFoundPageConfig } from './matching';

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

  const setSearchParams = (
    newParams: Record<string, string | string[] | null>,
    options: SetSearchParamsOptions = {}
  ) => {
    const { replace = false, merge = false } = options;
    
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
    
    if (replace) {
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
        <OutletContext.Provider value={{ component: () => <>{wrapped}</> }}>
          <Layout />
        </OutletContext.Provider>
      );
    }
    return result;
  };

  return (
    <RouterContext.Provider value={{ currentPath, params, searchParams, navigate, setSearchParams }}>
      {renderContent()}
    </RouterContext.Provider>
  );
}
