import type { SearchParams } from '../types';

export function parseSearchParams(search: string): SearchParams {
  const params: SearchParams = {};
  const urlParams = new URLSearchParams(search);
  
  for (const key of urlParams.keys()) {
    const values = urlParams.getAll(key);
    params[key] = values.length === 1 ? values[0] : values;
  }
  
  return params;
}

export function buildSearchString(params: Record<string, string | string[] | null>): string {
  const urlParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach(v => urlParams.append(key, v));
    } else {
      urlParams.set(key, value);
    }
  }
  
  const str = urlParams.toString();
  return str ? `?${str}` : '';
}
