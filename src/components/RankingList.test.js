import { render, screen } from '@testing-library/react';
import { RankingList } from './RankingList';

test('applies ranking status class when provided', () => {
  render(<RankingList name="김민준" center="서울센터" rank={1} status="top-3" />);

  expect(screen.getByText('김민준').closest('.ranking-list')).toHaveClass('top-3');
});
