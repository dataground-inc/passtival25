import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}), { virtual: true });

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ result: [] }),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the live ranking section', async () => {
  render(<App setUserData={jest.fn()} />);

  expect(screen.getByText('실시간 순위')).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});
