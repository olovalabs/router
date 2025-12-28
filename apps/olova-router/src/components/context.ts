import { createContext, useContext } from 'react';
import type { SearchParams, SetSearchParamsOptions } from './search-params';
import type { ComponentType } from 'react';

export interface RouterContextType {
  currentPath: string;
  params: Record<string, string>;
  searchParams: SearchParams;
  navigate: (path: string) => void;
  setSearchParams: (params: Record<string, string | string[] | null>, options?: SetSearchParamsOptions) => void;
}

export const RouterContext = createContext<RouterContextType | null>(null);

export interface OutletContextType {
  component: ComponentType | null;
}

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

export function useSearchParams(): [
  SearchParams,
  (params: Record<string, string | string[] | null>, options?: SetSearchParamsOptions) => void
] {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useSearchParams must be used within OlovaRouter');
  return [context.searchParams, context.setSearchParams];
}
