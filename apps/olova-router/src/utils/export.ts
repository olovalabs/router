import fs from 'fs';

export function detectExportType(filePath: string): { hasDefault: boolean; namedExport: string | null } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (/export\s+default\s+/.test(content)) {
      return { hasDefault: true, namedExport: null };
    }
    
    const namedMatch = content.match(/export\s+(?:const|function|class)\s+(\w+)/);
    if (namedMatch) {
      return { hasDefault: false, namedExport: namedMatch[1] };
    }
    
    const exportMatch = content.match(/export\s*\{\s*(\w+)(?:\s+as\s+default)?\s*\}/);
    if (exportMatch) {
      if (content.includes('as default')) {
        return { hasDefault: true, namedExport: null };
      }
      return { hasDefault: false, namedExport: exportMatch[1] };
    }
    
    return { hasDefault: false, namedExport: null };
  } catch {
    return { hasDefault: true, namedExport: null };
  }
}
