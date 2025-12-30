import { useContext } from 'react';
import { OutletContext } from './context';

export function Outlet() {
  const context = useContext(OutletContext);
  if (!context) return null;
  return <>{context.content}</>;
}
