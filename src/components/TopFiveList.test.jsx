import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { TopFiveList } from './TopFiveList';

it('renders only rank, full name, and center for every returned participant', () => {
  render(
    <TopFiveList
      entries={[
        {
          name: '김민준',
          center: '서울센터',
          score: 99,
          records: { standingLongJump: 300 },
        },
        {
          name: '박서연',
          center: '부산센터',
          score: 98,
          records: { standingLongJump: 290 },
        },
      ]}
    />,
  );

  const rows = screen.getAllByRole('listitem');

  expect(rows).toHaveLength(2);
  expect(within(rows[0]).getByText('1')).toBeInTheDocument();
  expect(within(rows[0]).getByText('김민준')).toBeInTheDocument();
  expect(within(rows[0]).getByText('서울센터')).toBeInTheDocument();
  expect(within(rows[1]).getByText('2')).toBeInTheDocument();
  expect(screen.queryByText('99')).not.toBeInTheDocument();
  expect(screen.queryByText('300')).not.toBeInTheDocument();
});

it('renders a neutral empty state when the group has no ranking rows', () => {
  render(<TopFiveList entries={[]} />);

  expect(screen.getByRole('status')).toHaveTextContent('아직 등록된 순위가 없습니다.');
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
});

it('uses five stable row placeholders while rankings load', () => {
  render(<TopFiveList entries={[]} isLoading />);

  expect(screen.getByRole('status')).toHaveTextContent('순위를 불러오는 중입니다.');
  expect(screen.getAllByTestId('ranking-placeholder')).toHaveLength(5);
});
