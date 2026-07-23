import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { RecordList } from './RecordList';

const records = {
  standingLongJump: 277,
  backStrength: null,
  shuttleRun10m: 9.17,
  medicineBall: 8.9,
  sitAndReach: 12.5,
};

it('renders the five records in the approved label order', () => {
  render(<RecordList records={records} />);

  const rows = screen.getAllByRole('group');

  expect(rows).toHaveLength(5);
  expect(rows.map((row) => within(row).getByRole('term').textContent)).toEqual([
    '제자리멀리뛰기',
    '배근력',
    '10m왕복달리기',
    '메디신볼던지기',
    '좌전굴(선택)',
  ]);
});

it.each([null, undefined, '', '   '])(
  'renders a missing record value as 미응시',
  (missingValue) => {
    render(<RecordList records={{ ...records, backStrength: missingValue }} />);

    expect(screen.getByText('배근력').nextElementSibling).toHaveTextContent('미응시');
  },
);

it('renders record values without adding units', () => {
  render(<RecordList records={records} />);

  expect(screen.getByText('제자리멀리뛰기').nextElementSibling).toHaveTextContent(/^277$/);
  expect(screen.getByText('10m왕복달리기').nextElementSibling).toHaveTextContent(/^9.17$/);
});
