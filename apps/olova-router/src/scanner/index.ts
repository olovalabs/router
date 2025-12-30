import path from 'path';
import fs from 'fs';
import type { RouteEntry, NotFoundEntry, ScanResult, LayoutEntry } from '../types';
import { pathToRoute, isRouteGroup } from '../utils';

function scanDirectory(
  dir: string, 
  rootDir: string, 
  extensions: string[], 
  routes: RouteEntry[], 
  notFoundPages: NotFoundEntry[],
  layouts: LayoutEntry[],
  isRoot = false
) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'assets' || entry.name.startsWith('_')) continue;
      scanDirectory(fullPath, rootDir, extensions, routes, notFoundPages, layouts, false);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const baseName = path.basename(entry.name, ext);
      
      if (baseName === '_layout' && extensions.includes(ext)) {
        const relativePath = path.relative(rootDir, dir);
        const { routePath } = pathToRoute(relativePath, path.sep);
        layouts.push({ 
          path: isRoot ? '/' : routePath, 
          filePath: fullPath 
        });
      }
      else if (baseName === '404' && extensions.includes(ext)) {
        const relativeParts = path.relative(rootDir, dir).split(path.sep).filter(Boolean);
        const filteredParts = relativeParts.filter(p => !isRouteGroup(p));
        const pathPrefix = isRoot ? '' : '/' + filteredParts.join('/');
        notFoundPages.push({ pathPrefix: pathPrefix || '', filePath: fullPath });
      } else if (isRoot && baseName === 'App' && extensions.includes(ext)) {
        routes.push({ path: '/', filePath: fullPath, isDynamic: false, params: [] });
      } else if (!isRoot && baseName === 'index' && extensions.includes(ext)) {
        const relativePath = path.relative(rootDir, path.dirname(fullPath));
        const { routePath, params } = pathToRoute(relativePath, path.sep);
        routes.push({ path: routePath, filePath: fullPath, isDynamic: params.length > 0, params });
      }
    }
  }
}

export function scanRoutes(rootDir: string, extensions: string[]): ScanResult {
  const routes: RouteEntry[] = [];
  const notFoundPages: NotFoundEntry[] = [];
  const layouts: LayoutEntry[] = [];
  const absoluteRoot = path.isAbsolute(rootDir) ? rootDir : path.resolve(rootDir);
  
  if (!fs.existsSync(absoluteRoot)) {
    throw new Error(`Olova Router: Root directory does not exist: ${absoluteRoot}`);
  }

  scanDirectory(absoluteRoot, absoluteRoot, extensions, routes, notFoundPages, layouts, true);
  routes.sort((a, b) => (a.isDynamic !== b.isDynamic ? (a.isDynamic ? 1 : -1) : a.path.localeCompare(b.path)));
  notFoundPages.sort((a, b) => b.pathPrefix.length - a.pathPrefix.length);
  layouts.sort((a, b) => a.path.length - b.path.length);
  return { routes, notFoundPages, layouts };
}
