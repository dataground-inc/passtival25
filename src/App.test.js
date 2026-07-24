import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
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
  mockNavigate.mockReset();
});

test('renders the live ranking section', async () => {
  render(<App setUserData={jest.fn()} />);

  expect(screen.getByText('실시간 순위')).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});

test('navigates to the personal record while its lookup is pending', async () => {
  let resolveExamRequest;
  global.fetch.mockImplementation((url) => {
    if (url.includes('mode=exam')) {
      return new Promise((resolve) => {
        resolveExamRequest = resolve;
      });
    }

    return Promise.resolve({ json: () => Promise.resolve({ result: [] }) });
  });
  const setRecordLoading = jest.fn();
  const { container } = render(<App setRecordLoading={setRecordLoading} setUserData={jest.fn()} />);

  fireEvent.click(container.querySelector('.button-float'));
  fireEvent.change(container.querySelector('input'), { target: { value: '1234' } });
  fireEvent.click(container.querySelector('.cta-button'));

  await waitFor(() => expect(setRecordLoading).toHaveBeenCalledWith(true));
  expect(mockNavigate).toHaveBeenCalledWith('/my-ranking');

  resolveExamRequest({ json: () => Promise.resolve({ rank: 1 }) });
  await waitFor(() => expect(setRecordLoading).toHaveBeenLastCalledWith(false));
});

test('returns home when the personal-record API reports a missing exam number', async () => {
  global.fetch.mockImplementation((url) => {
    if (url.includes('mode=exam')) {
      return Promise.resolve({ json: () => Promise.resolve({ error: 'not found' }) });
    }

    return Promise.resolve({ json: () => Promise.resolve({ result: [] }) });
  });
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  const setRecordLoading = jest.fn();
  const { container } = render(<App setRecordLoading={setRecordLoading} setUserData={jest.fn()} />);

  fireEvent.click(container.querySelector('.button-float'));
  fireEvent.change(container.querySelector('input'), { target: { value: '1234' } });
  fireEvent.click(container.querySelector('.cta-button'));

  await waitFor(() => expect(mockNavigate).toHaveBeenLastCalledWith('/'));
  expect(setRecordLoading).toHaveBeenLastCalledWith(false);
});
