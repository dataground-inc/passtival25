import { render, screen } from '@testing-library/react';
import { SkeletonList } from './SkeletonList';

test('renders an accessible TOP 5 row placeholder', () => {
  render(<SkeletonList />);

  expect(screen.getByRole('status', { name: 'TOP 5 ?쒖쐞瑜?遺덈윭?ㅻ뒗 以?' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByTestId('top5-skeleton-row')).toBeInTheDocument();
});
