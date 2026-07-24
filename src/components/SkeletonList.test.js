import { render, screen } from '@testing-library/react';
import { SkeletonList } from './SkeletonList';

test('renders an accessible TOP 5 row placeholder', () => {
  render(<SkeletonList />);

  expect(screen.getByRole('status', { name: 'TOP 5 ?쒖쐞瑜?遺덈윭?ㅻ뒗 以?' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByTestId('top5-skeleton-row')).toBeInTheDocument();
});

test('uses the required TOP 5 loading colors and row height', () => {
  render(<SkeletonList />);

  const row = screen.getByTestId('top5-skeleton-row');
  const skeletons = row.querySelectorAll('.react-loading-skeleton');

  expect(row).toHaveStyle({
    background: '#0545FF',
    height: '60px',
  });
  expect(skeletons).toHaveLength(3);
  skeletons.forEach((skeleton) => {
    expect(skeleton).toHaveStyle({
      '--base-color': '#E4E6F0',
      '--highlight-color': '#0545FF',
    });
  });
});
