import type { RouteConfig } from './types';
import { emptyRoutesTemplate, generateRoutesTemplate } from './templates';

export function generateRoutesFile(routes: RouteConfig[]): string {
  if (routes.length === 0) {
    return emptyRoutesTemplate;
  }

  const imports = routes
    .map((route, index) => `import Route${index} from '${route.component}';`)
    .join('\n');

  const routeObjects = routes
    .map((route, index) => {
      return `  { path: '${route.path}', component: Route${index} }`;
    })
    .join(',\n');

  const routePaths = routes.map(r => `'${r.path}'`).join(' | ');

  return generateRoutesTemplate(imports, routeObjects, routePaths);
}
