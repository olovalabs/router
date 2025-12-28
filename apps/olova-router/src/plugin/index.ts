import type { Plugin, ResolvedConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import type { OlovaRouterOptions } from '../types';
import { scanRoutes } from '../scanner';
import { detectExportType } from '../utils';
import { generateRouteTree, type RouteWithExport, type NotFoundWithExport, type LayoutWithExport } from '../generator';

export function olovaRouter(options: OlovaRouterOptions = {}): Plugin {
  const rootDir = options.rootDir || 'src';
  const extensions = options.extensions || ['.tsx', '.ts'];

  let config: ResolvedConfig;
  let absoluteRootDir: string;
  let watcher: fs.FSWatcher | null = null;

  function generateRouteTreeFile() {
    const { routes, notFoundPages, layouts } = scanRoutes(absoluteRootDir, extensions);
    
    const routeConfigs: RouteWithExport[] = routes.map(r => {
      const exportInfo = detectExportType(r.filePath);
      return {
        path: r.path,
        component: r.filePath.replace(/\\/g, '/'),
        params: r.params.length > 0 ? r.params : undefined,
        hasDefault: exportInfo.hasDefault,
        namedExport: exportInfo.namedExport
      };
    });

    const notFoundConfigs: NotFoundWithExport[] = notFoundPages.map(nf => {
      const exportInfo = detectExportType(nf.filePath);
      return {
        pathPrefix: nf.pathPrefix,
        filePath: nf.filePath.replace(/\\/g, '/'),
        hasDefault: exportInfo.hasDefault,
        namedExport: exportInfo.namedExport
      };
    });

    const layoutConfigs: LayoutWithExport[] = layouts.map(l => {
      const exportInfo = detectExportType(l.filePath);
      return {
        path: l.path,
        filePath: l.filePath.replace(/\\/g, '/'),
        hasDefault: exportInfo.hasDefault,
        namedExport: exportInfo.namedExport
      };
    });
    
    const content = generateRouteTree(routeConfigs, notFoundConfigs, layoutConfigs, absoluteRootDir);
    const treePath = path.resolve(absoluteRootDir, 'route.tree.ts');
    
    const existing = fs.existsSync(treePath) ? fs.readFileSync(treePath, 'utf-8') : '';
    if (existing !== content) {
      fs.writeFileSync(treePath, content);
      console.log('\x1b[32m[olova-router]\x1b[0m Route tree updated');
    }
  }

  function startWatcher() {
    if (watcher) return;

    watcher = fs.watch(absoluteRootDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      if (filename.includes('route.tree.ts')) return;
      
      const isIndexFile = filename.endsWith('index.tsx') || filename.endsWith('index.ts');
      const isAppFile = filename === 'App.tsx' || filename === 'App.ts';
      const is404File = filename.endsWith('404.tsx') || filename.endsWith('404.ts');
      const isLayoutFile = filename.endsWith('_layout.tsx') || filename.endsWith('_layout.ts');
      const isDirectory = !filename.includes('.');
      const isDynamicSegment = filename.includes('$') || filename.includes('[');
      const isRenameEvent = eventType === 'rename';
      
      if (isIndexFile || isAppFile || is404File || isLayoutFile || isDirectory || isDynamicSegment || isRenameEvent) {
        setTimeout(() => generateRouteTreeFile(), 100);
      }
    });

    console.log('\x1b[32m[olova-router]\x1b[0m Watching for route changes...');
  }

  return {
    name: 'olova-router',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
      absoluteRootDir = path.resolve(config.root, rootDir);
    },

    buildStart() {
      generateRouteTreeFile();
      
      if (config.command === 'serve') {
        startWatcher();
      }
    },

    buildEnd() {
      if (watcher) {
        watcher.close();
        watcher = null;
      }
    },
  };
}

export default olovaRouter;
