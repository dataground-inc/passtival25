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
