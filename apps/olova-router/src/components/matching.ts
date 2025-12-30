import type { ComponentType } from 'react';
import type { NotFoundPageConfig } from '../types';

export function matchRoute(pattern: string, pathname: string) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  const params: Record<string, string> = {};
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    
    if (patternPart === '*') {
      params['slug'] = pathParts.slice(i).join('/');
      return { match: true, params };
    }
    
    if (pathPart === undefined) {
      return { match: false, params: {} };
    }
    
    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = pathPart;
    } else if (patternPart !== pathPart) {
      return { match: false, params: {} };
    }
  }
  
  if (pathParts.length > patternParts.length) {
    return { match: false, params: {} };
  }

  return { match: true, params };
}

export function matchLayoutScope(layoutPath: string, pathname: string): boolean {
  if (layoutPath === '/') return true;
  return pathname === layoutPath || pathname.startsWith(layoutPath + '/');
}

export function findNotFoundPage(path: string, notFoundPages: NotFoundPageConfig[]): ComponentType | null {
  if (!notFoundPages || notFoundPages.length === 0) return null;
  
  const sorted = [...notFoundPages].sort((a, b) => 
    b.pathPrefix.length - a.pathPrefix.length
  );
  
  for (const nf of sorted) {
    if (nf.pathPrefix === '') {
      return nf.component;
    }
    if (path === nf.pathPrefix || path.startsWith(nf.pathPrefix + '/')) {
      return nf.component;
    }
  }
  return null;
}
