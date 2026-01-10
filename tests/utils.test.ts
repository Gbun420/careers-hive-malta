import { expect, test } from 'vitest';
import { cn } from '../lib/utils';

test('cn merges classes correctly', () => {
  expect(cn('p-4', 'p-8')).toBe('p-8');
  expect(cn('text-red-500', null, 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  expect(cn('w-full', { 'block': true, 'hidden': false })).toBe('w-full block');
});
