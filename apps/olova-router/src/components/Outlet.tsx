import { useContext } from 'react';
import { OutletContext } from './context';

export function Outlet() {
  const context = useContext(OutletContext);
  if (!context?.component) return null;
  const Component = context.component;
  return <Component />;
}
