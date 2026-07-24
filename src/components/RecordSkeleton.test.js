import { render, screen } from '@testing-library/react';
import { RecordSkeleton } from './RecordSkeleton';
import { MyRankingPage } from '../pages/MyRankingPage';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}), { virtual: true });

test('renders a stable personal-record loading placeholder', () => {
  render(<RecordSkeleton />);

  expect(screen.getByRole('status', { name: '내 기록을 불러오는 중' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.getAllByTestId('record-skeleton-item')).toHaveLength(5);
});

test('shows a skeleton instead of a missing-data message while loading', () => {
  render(<MyRankingPage isLoading userData={null} />);

  expect(screen.getByRole('status', { name: '내 기록을 불러오는 중' })).toBeInTheDocument();
});

test('uses the required personal-record loading colors', () => {
  const { container } = render(<RecordSkeleton />);
  const skeletons = container.querySelectorAll('.react-loading-skeleton');

  expect(skeletons).toHaveLength(12);
  skeletons.forEach((skeleton) => {
    expect(skeleton).toHaveStyle({
      '--base-color': '#E4E6F0',
      '--highlight-color': '#0545FF',
    });
  });
});
