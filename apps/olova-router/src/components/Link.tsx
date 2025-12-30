import type { ReactNode } from 'react';
import { useRouter } from './context';

type ResolveSegment<S extends string> = 
  S extends `:${string}` ? string : 
  S extends '*' ? string : 
  S;

type ResolvePathSegments<Path extends string> = 
  Path extends `${infer Segment}/${infer Rest}`
    ? `${ResolveSegment<Segment>}/${ResolvePathSegments<Rest>}`
    : ResolveSegment<Path>;

export type ResolveRoutePath<Path extends string> = 
  Path extends `${infer Base}/*`
    ? `${ResolvePathSegments<Base>}/${string}`
    : ResolvePathSegments<Path>;

type ResolveRoutes<T extends string> = T extends string ? ResolveRoutePath<T> : never;

export function createLink<T extends string>() {
  const Link = ({ href, children, className }: { href: ResolveRoutes<T>; children: ReactNode; className?: string }) => {
    const { navigate } = useRouter();
    return (
      <a href={href} className={className} onClick={(e) => { e.preventDefault(); navigate(href); }}>
        {children}
      </a>
    );
  };
  return Link;
}
