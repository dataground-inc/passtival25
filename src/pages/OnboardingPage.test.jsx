import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { lookupParticipant } from '../api/passtivalApi';
import { readExamNumber } from '../storage/examSession';
import { OnboardingPage } from './OnboardingPage';

vi.mock('../api/passtivalApi', async () => {
  const actual = await vi.importActual('../api/passtivalApi');

  return {
    ...actual,
    lookupParticipant: vi.fn(),
  };
});

beforeEach(() => {
  sessionStorage.clear();
  lookupParticipant.mockReset();
});

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderPage(initialEntry = '/') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/my-ranking" element={<p>개인 순위 결과</p>} />
        <Route path="/top5" element={<p>TOP 5 결과</p>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

it('renders the local title artwork and both exact entry commands', () => {
  renderPage();

  expect(
    screen.getByRole('img', { name: 'BEYOND LIMITS. BEYOND PASS.' }),
  ).toHaveAttribute('src', expect.stringContaining('passtival-title.png'));
  expect(screen.getByRole('button', { name: '내 순위 확인하기' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'TOP 5 순위' })).toBeInTheDocument();
});

it('opens the exam lookup sheet from the primary command', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.click(screen.getByRole('button', { name: '내 순위 확인하기' }));

  expect(
    screen.getByRole('dialog', { name: '수험번호 입력' }),
  ).toBeInTheDocument();
});

it('stores the confirmed exam number before navigating to personal ranking', async () => {
  const user = userEvent.setup();
  lookupParticipant.mockResolvedValue({ examNumber: '00123' });
  renderPage();

  await user.click(screen.getByRole('button', { name: '내 순위 확인하기' }));
  await user.type(screen.getByLabelText('수험번호'), '00123');
  await user.click(screen.getByRole('button', { name: '기록 확인하기' }));

  await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/my-ranking'));
  expect(readExamNumber()).toBe('00123');
});

it('navigates to the TOP 5 route from the secondary command', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.click(screen.getByRole('button', { name: 'TOP 5 순위' }));

  expect(screen.getByTestId('location')).toHaveTextContent('/top5');
});

it('opens lookup mode once and removes its query parameter', async () => {
  renderPage('/?lookup=1');

  expect(
    await screen.findByRole('dialog', { name: '수험번호 입력' }),
  ).toBeInTheDocument();
  expect(screen.getByTestId('location')).toHaveTextContent('/');
});
