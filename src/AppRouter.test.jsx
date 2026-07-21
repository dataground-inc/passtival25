import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, expect, it } from 'vitest';
import AppRouter from './AppRouter';

beforeEach(() => sessionStorage.clear());

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
