import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { TopBar } from './TopBar';

const sharedStyles = readFileSync('src/styles/shared.css', 'utf8');

it('uses an accessible Lucide back icon inside the stable 48px hit target', () => {
  const onBack = vi.fn();
  const backRule = sharedStyles.match(/\.top-bar__back\s*\{([^}]*)\}/)?.[1];

  render(<TopBar onBack={onBack} />);

  const button = screen.getByRole('button', { name: '뒤로 가기' });
  const icon = button.querySelector('svg');

  expect(backRule).toContain('width: 48px;');
  expect(backRule).toContain('height: 48px;');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('lucide-arrow-left');
  expect(button).not.toHaveTextContent('‹');

  fireEvent.click(button);
  expect(onBack).toHaveBeenCalledOnce();
});

it('applies an opt-in fixed variant centered over the app shell', () => {
  const fixedRule = sharedStyles.match(/\.top-bar--fixed\s*\{([^}]*)\}/)?.[1];
  const { rerender } = render(<TopBar fixed onBack={() => {}} />);

  expect(screen.getByRole('banner')).toHaveClass('top-bar--fixed');
  expect(fixedRule).toContain('position: fixed;');
  expect(fixedRule).toContain('width: min(100%, var(--page-max-width));');
  expect(fixedRule).toContain('margin: 0 auto;');
  expect(fixedRule).toContain('z-index: 20;');
  expect(fixedRule).not.toMatch(/\bbackground\s*:/);
  expect(fixedRule).not.toMatch(/\bbackdrop-filter\s*:/);
  expect(fixedRule).not.toMatch(/\bbox-shadow\s*:/);

  rerender(<TopBar onBack={() => {}} />);
  expect(screen.getByRole('banner')).not.toHaveClass('top-bar--fixed');
});
