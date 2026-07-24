import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  jest.useRealTimers();
  jest.restoreAllMocks();
  mockNavigate.mockReset();
});

test('renders the live ranking section', async () => {
  render(<App setUserData={jest.fn()} />);

  expect(screen.getByText('실시간 순위')).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});

test('shows the zero-padded TOP5 fetch time after a successful response', async () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 6, 24, 9, 5));

  render(<App setUserData={jest.fn()} />);

  expect(await screen.findByText('09시 05분 기준')).toBeInTheDocument();
});

test('clears the TOP5 fetch time while a filter-change response is pending', async () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 6, 24, 9, 5));
  global.fetch
    .mockResolvedValueOnce({ json: () => Promise.resolve({ result: [] }) })
    .mockImplementationOnce(() => new Promise(() => {}));

  const { container } = render(<App setUserData={jest.fn()} />);

  expect(await screen.findByText('09시 05분 기준')).toBeInTheDocument();

  fireEvent.click(container.querySelector('.dropdown-toggle'));
  fireEvent.click(screen.getByText('고3 이상 여자'));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  expect(screen.queryByText('09시 05분 기준')).not.toBeInTheDocument();
});

test('ignores an older TOP5 response while the latest filter request is pending', async () => {
  let resolveInitialResponse;
  jest.useFakeTimers().setSystemTime(new Date(2026, 6, 24, 9, 5));
  global.fetch
    .mockImplementationOnce(() => new Promise((resolve) => {
      resolveInitialResponse = resolve;
    }))
    .mockImplementationOnce(() => new Promise(() => {}));

  const { container } = render(<App setUserData={jest.fn()} />);

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  fireEvent.click(container.querySelector('.dropdown-toggle'));
  fireEvent.click(screen.getByText('고3 이상 여자'));
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

  await act(async () => {
    resolveInitialResponse({ json: () => Promise.resolve({ result: [] }) });
  });

  expect(screen.queryByText('09시 05분 기준')).not.toBeInTheDocument();
  expect(screen.getAllByTestId('top5-skeleton-row')).toHaveLength(5);
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
