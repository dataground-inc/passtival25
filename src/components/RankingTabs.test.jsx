import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { GROUPS } from '../api/passtivalApi';
import { RankingTabs } from './RankingTabs';

it('renders the event-band names while retaining the Apps Script group values', () => {
  render(
    <RankingTabs
      groups={GROUPS}
      labels={{
        '고3 남자': '고3 이상 남자',
        '고3 여자': '고3 이상 여자',
        '고2 남자': '고2 이하 남자',
        '고2 여자': '고2 이하 여자',
      }}
      onSelect={() => {}}
      selectedGroup={GROUPS[0]}
    />,
  );

  const tabs = screen.getAllByRole('tab');

  expect(tabs.map((tab) => tab.textContent)).toEqual([
    '고3 이상 남자',
    '고3 이상 여자',
    '고2 이하 남자',
    '고2 이하 여자',
  ]);
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  expect(tabs[0]).toHaveAttribute('tabindex', '0');
  expect(tabs.slice(1).every((tab) => tab.getAttribute('tabindex') === '-1')).toBe(true);
});

it('selects a group by click and arrow-key navigation', async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();

  render(
    <RankingTabs
      groups={GROUPS}
      onSelect={onSelect}
      selectedGroup={GROUPS[0]}
    />,
  );

  await user.click(screen.getByRole('tab', { name: '고3 이상 여자' }));
  expect(onSelect).toHaveBeenLastCalledWith('고3 여자');

  screen.getByRole('tab', { name: '고3 이상 남자' }).focus();
  await user.keyboard('{ArrowRight}');

  expect(onSelect).toHaveBeenLastCalledWith('고3 여자');
  expect(screen.getByRole('tab', { name: '고3 이상 여자' })).toHaveFocus();
});
