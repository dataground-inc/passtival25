import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fetchTopFive } from '../api/passtivalApi';
import { TopFivePage } from './TopFivePage';

vi.mock('../api/passtivalApi', async () => {
  const actual = await vi.importActual('../api/passtivalApi');

  return {
    ...actual,
    fetchTopFive: vi.fn(),
  };
});

const rankings = [
  { name: '김민준', center: '서울센터', score: 100 },
  { name: '이서연', center: '부산센터', score: 99 },
];

beforeEach(() => {
  fetchTopFive.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{location.pathname}</output>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/top5']}>
      <Routes>
        <Route path="/top5" element={<TopFivePage />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

it('loads the first exact group and renders a short response without scores', async () => {
  fetchTopFive.mockResolvedValue(rankings);

  renderPage();

  expect(screen.getByRole('main')).toHaveClass('top-five');
  expect(screen.getByRole('heading', { name: 'Top 5' })).toBeInTheDocument();
  expect(await screen.findByText('김민준')).toBeInTheDocument();
  expect(fetchTopFive).toHaveBeenCalledWith('고3 남자');
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.queryByText('100')).not.toBeInTheDocument();
});

it('shows the successful TOP5 fetch time with zero-padded hours and minutes', async () => {
  vi.spyOn(Date.prototype, 'getHours').mockReturnValue(9);
  vi.spyOn(Date.prototype, 'getMinutes').mockReturnValue(5);
  fetchTopFive.mockResolvedValue(rankings);

  renderPage();

  expect(await screen.findByText('09시 05분 기준', {}, { timeout: 500 })).toBeInTheDocument();
});

it('sends the selected group verbatim and renders its empty state', async () => {
  const user = userEvent.setup();
  fetchTopFive
    .mockResolvedValueOnce(rankings)
    .mockResolvedValueOnce([]);

  renderPage();

  await screen.findByText('김민준');
  await user.click(screen.getByRole('tab', { name: '고3 이상 여자' }));

  expect(fetchTopFive).toHaveBeenLastCalledWith('고3 여자');
  expect(await screen.findByRole('status')).toHaveTextContent('아직 등록된 순위가 없습니다.');
});

it('retries the current group after a loading error', async () => {
  const user = userEvent.setup();
  fetchTopFive
    .mockRejectedValueOnce(new Error('service unavailable'))
    .mockResolvedValueOnce(rankings);

  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('순위를 불러오지 못했습니다.');
  await user.click(screen.getByRole('button', { name: '다시 시도' }));

  expect(await screen.findByText('김민준')).toBeInTheDocument();
  expect(fetchTopFive).toHaveBeenCalledTimes(2);
  expect(fetchTopFive).toHaveBeenLastCalledWith('고3 남자');
});

it('ignores an older response after rapid group changes', async () => {
  const user = userEvent.setup();
  const firstRequest = deferred();
  const secondRequest = deferred();
  fetchTopFive
    .mockReturnValueOnce(firstRequest.promise)
    .mockReturnValueOnce(secondRequest.promise);

  renderPage();

  await user.click(screen.getByRole('tab', { name: '고3 이상 여자' }));
  secondRequest.resolve([{ name: '최신 참가자', center: '대전센터' }]);

  expect(await screen.findByText('최신 참가자')).toBeInTheDocument();

  await act(async () => {
    firstRequest.resolve([{ name: '이전 참가자', center: '서울센터' }]);
    await firstRequest.promise;
  });

  expect(screen.queryByText('이전 참가자')).not.toBeInTheDocument();
  expect(screen.getByText('최신 참가자')).toBeInTheDocument();
});

it('navigates back to the onboarding page from the shared top bar', async () => {
  const user = userEvent.setup();
  fetchTopFive.mockResolvedValue(rankings);

  renderPage();

  await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

  expect(screen.getByTestId('location')).toHaveTextContent('/');
});
