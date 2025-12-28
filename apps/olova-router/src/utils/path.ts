import type { DynamicSegmentResult } from '../types';

export function parseDynamicSegment(segment: string): DynamicSegmentResult & { isCatchAll: boolean } {
  if (segment === '$' || segment.match(/^\[\.\.\.(.+)\]$/)) {
    const paramName = segment === '$' ? 'slug' : segment.match(/^\[\.\.\.(.+)\]$/)?.[1] || 'slug';
    return { isDynamic: true, paramName, isCatchAll: true };
  }
  
  const bracketMatch = segment.match(/^\[(.+)\]$/);
  if (bracketMatch) {
    return { isDynamic: true, paramName: bracketMatch[1], isCatchAll: false };
  }
  
  const dollarMatch = segment.match(/^\$(.+)$/);
  if (dollarMatch) {
    return { isDynamic: true, paramName: dollarMatch[1], isCatchAll: false };
  }
  
  return { isDynamic: false, paramName: null, isCatchAll: false };
}

export function isRouteGroup(segment: string): boolean {
  return /^\(.+\)$/.test(segment);
}

export function pathToRoute(relativePath: string, sep: string) {
  const params: string[] = [];
  let hasCatchAll = false;
  const segments = relativePath.split(sep).filter(Boolean);
  
  const routeSegments = segments
    .filter(segment => !isRouteGroup(segment))
    .map(segment => {
      const { isDynamic, paramName, isCatchAll } = parseDynamicSegment(segment);
      if (isDynamic && paramName) {
        params.push(paramName);
        if (isCatchAll) {
          hasCatchAll = true;
          return `*`;
        }
        return `:${paramName}`;
      }
      return segment;
    });

  const routePath = '/' + routeSegments.join('/');
  return { routePath: routePath === '/' ? '/' : routePath, params, hasCatchAll };
}
