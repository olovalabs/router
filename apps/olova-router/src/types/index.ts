import type { ComponentType, ReactNode } from 'react';
export type { PluginOption, ResolvedConfig } from 'vite';

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

export interface RetryConfig {
  maxRetries?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
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

export interface RouteEntry {
  path: string;
  filePath: string;
  isDynamic: boolean;
  params: string[];
}

export interface ScannerOptions {
  rootDir: string;
  extensions: string[];
}

export interface Metadata {
  title?: string;
  description?: string;
  keywords?: string[];
  [key: string]: any;
}

export interface RouteConfig {
  path: string;
  component: string;
  params?: string[];
  metadata?: Metadata;
}

export interface GeneratorOptions {
  routes: RouteEntry[];
  basePath: string;
}

export interface OlovaRouterOptions {
  rootDir?: string;
  extensions?: string[];
}

export interface DynamicSegmentResult {
  isDynamic: boolean;
  paramName: string | null;
}

export interface NotFoundEntry {
  pathPrefix: string;
  filePath: string;
}

export interface NotFoundPageConfig {
  pathPrefix: string;
  component: ComponentType;
  metadata?: Metadata;
}

export interface LayoutEntry {
  path: string;
  filePath: string;
}

export interface ScanResult {
  routes: RouteEntry[];
  notFoundPages: NotFoundEntry[];
  layouts: LayoutEntry[];
}

export interface RouteWithExport extends RouteConfig {
  hasDefault: boolean;
  namedExport: string | null;
  hasMetadata: boolean;
  hasRoute: boolean;
}

export interface NotFoundWithExport extends NotFoundEntry {
  hasDefault: boolean;
  namedExport: string | null;
  hasMetadata: boolean;
}

export interface LayoutWithExport extends LayoutEntry {
  hasDefault: boolean;
  namedExport: string | null;
  hasMetadata: boolean;
}

export interface Route {
  path: string;
  component?: ComponentType;
  loader?: () => Promise<any>;
  metadata?: Metadata;

  routeDefinition?: RouteDefinition;
}

export interface LayoutRoute {
  path: string;
  layout?: ComponentType;
  loader?: () => Promise<any>;
  children: Route[];
  metadata?: Metadata;
}

export type SearchParams = Record<string, string | string[]>;

export interface SetSearchParamsOptions {
  replace?: boolean;
  merge?: boolean;
}

export interface RouterContextType {
  currentPath: string;
  params: Record<string, string>;
  searchParams: SearchParams;
  navigate: (path: string) => void;
  push: (path: string) => void;
  replace: (path: string) => void;
  setSearchParams: (params: Record<string, string | string[] | null>, options?: SetSearchParamsOptions) => void;
  prefetch: (path: string) => void;
}

export interface OutletContextType {
  content: ReactNode;
}
