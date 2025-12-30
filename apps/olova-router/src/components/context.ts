import { createContext, useContext, useMemo } from 'react';
import type { RouterContextType, OutletContextType } from '../types';

export const RouterContext = createContext<RouterContextType | null>(null);

export const OutletContext = createContext<OutletContextType | null>(null);

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useRouter must be used within OlovaRouter');
  return context;
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const context = useContext(RouterContext);
  return (context?.params || {}) as T;
}

export function useSearchParams(): URLSearchParams {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useSearchParams must be used within OlovaRouter');
  
  return useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(context.searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });
    return params;
  }, [context.searchParams]);
}

export function usePathname(): string {
  const context = useContext(RouterContext);
  if (!context) throw new Error('usePathname must be used within OlovaRouter');
  return context.currentPath;
}
