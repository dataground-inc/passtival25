import { beforeEach, expect, it } from 'vitest';
import { clearExamNumber, readExamNumber, saveExamNumber } from './examSession';

beforeEach(() => sessionStorage.clear());

it('stores a trimmed exam number for this session', () => {
  saveExamNumber(' 00123 ');

  expect(readExamNumber()).toBe('00123');

  clearExamNumber();

  expect(readExamNumber()).toBeNull();
});

it('rejects blank exam numbers', () => {
  saveExamNumber('   ');

  expect(readExamNumber()).toBeNull();
});
