import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { fetchTopFive, GROUPS } from './api/passtivalApi';
import AppRouter from './AppRouter';

const appRouterSource = readFileSync('src/AppRouter.jsx', 'utf8');

vi.mock('./api/passtivalApi', async () => {
  const actual = await vi.importActual('./api/passtivalApi');

  return {
    ...actual,
    fetchTopFive: vi.fn(),
  };
});

beforeEach(() => {
  sessionStorage.clear();
  fetchTopFive.mockReset();
  fetchTopFive.mockReturnValue(new Promise(() => {}));
});

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

it('redirects a result route without a session to lookup mode', async () => {
  render(
    <MemoryRouter initialEntries={['/my-ranking']}>
      <AppRouter />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole('dialog', { name: '\uC218\uD5D8\uBC88\uD638 \uC785\uB825' }),
  ).toBeInTheDocument();
});

it('renders the top five route', () => {
  render(
    <MemoryRouter initialEntries={['/top5']}>
      <AppRouter />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { name: 'Top 5' })).toBeInTheDocument();
});

it('starts the destination request immediately during route exit motion', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AppRouter />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole('button', { name: /TOP 5/ }));

  expect(fetchTopFive).toHaveBeenCalledWith(GROUPS[0]);
});

it('pops the exiting route frame out of layout while the destination mounts', () => {
  expect(appRouterSource).toMatch(
    /<AnimatePresence\s+initial=\{false\}\s+mode="popLayout">\s*<motion\.div/,
  );
});

it('uses the required accessible name for the primary lookup command', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AppRouter />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole('button', { name: '\uB0B4 \uC21C\uC704 \uD655\uC778\uD558\uAE30' }),
  ).toBeInTheDocument();
});

it('removes lookup mode from the URL after opening the sheet', async () => {
  render(
    <MemoryRouter initialEntries={['/?lookup=1']}>
      <AppRouter />
      <LocationProbe />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole('dialog', { name: '\uC218\uD5D8\uBC88\uD638 \uC785\uB825' }),
  ).toBeInTheDocument();
  expect(screen.getByTestId('location')).toHaveTextContent('/');
});
