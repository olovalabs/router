import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routes, notFoundPages, layouts, OlovaRouter } from '@/route.tree';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OlovaRouter routes={routes} layouts={layouts} notFoundPages={notFoundPages} />
  </StrictMode>
);
