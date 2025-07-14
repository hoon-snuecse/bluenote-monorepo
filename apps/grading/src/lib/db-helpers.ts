// Database helper functions for JSON field handling

export function parseJsonField(field: any): any {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

export function stringifyJsonField(field: any): any {
  if (typeof field === 'object' && field !== null) {
    return field; // PostgreSQL handles JSON natively
  }
  return field;
}