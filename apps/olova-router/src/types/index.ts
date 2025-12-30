import type { ComponentType, ReactNode } from 'react';
export type { PluginOption, ResolvedConfig } from 'vite';

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

/** Metadata configuration */
export interface Metadata {
  title?: string;
  description?: string;
  keywords?: string[];
  [key: string]: any;
}

/** Route configuration for the generated module */
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

/** Route with export detection information for generator */
export interface RouteWithExport extends RouteConfig {
  hasDefault: boolean;
  namedExport: string | null;
  hasMetadata: boolean;
}

/** 404 page with export detection information */
export interface NotFoundWithExport extends NotFoundEntry {
  hasDefault: boolean;
  namedExport: string | null;
  hasMetadata: boolean;
}

/** Layout with export detection information */
export interface LayoutWithExport extends LayoutEntry {
  hasDefault: boolean;
  namedExport: string | null;
  hasMetadata: boolean;
}

export interface Route {
  path: string;
  component: ComponentType;
  metadata?: Metadata;
}

export interface LayoutRoute {
  path: string;
  layout: ComponentType;
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
}

export interface OutletContextType {
  content: ReactNode;
}


