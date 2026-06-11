import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils (cn helper)', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should ignore falsy values', () => {
    expect(cn('class1', null, undefined, false, 'class2')).toBe('class1 class2');
  });

  it('should merge arrays and object class values', () => {
    expect(cn('class1', { class2: true, class3: false }, ['class4'])).toBe('class1 class2 class4');
  });

  it('should resolve Tailwind class name conflicts correctly', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});
