// lib/dateUtils.ts

export function formatDateForDisplay(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  return date.toLocaleDateString();
}

export function parseDateString(dateStr: string): Date {
  if (!dateStr) {
    return new Date();
  }
  return new Date(dateStr);
}