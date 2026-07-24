import { useRef, useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasstivalApiError, lookupParticipant } from '../api/passtivalApi';
import { ExamLookupSheet } from './ExamLookupSheet';

vi.mock('../api/passtivalApi', async () => {
  const actual = await vi.importActual('../api/passtivalApi');

  return {
    ...actual,
    lookupParticipant: vi.fn(),
  };
});

beforeEach(() => {
  lookupParticipant.mockReset();
});

function renderSheet(overrides = {}) {
  const triggerRef = { current: document.createElement('button') };
  const props = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    triggerRef,
    ...overrides,
  };

  render(<ExamLookupSheet {...props} />);

  return props;
}

describe('ExamLookupSheet', () => {
  it('shows an inline error when submitted without an exam number', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole('button', { name: '기록 확인하기' }));

    expect(screen.getByRole('alert')).toHaveTextContent('수험번호를 입력해 주세요.');
    expect(lookupParticipant).not.toHaveBeenCalled();
  });

  it('submits the preserved exam number and reports success', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    lookupParticipant.mockResolvedValue({ examNumber: '00123' });
    renderSheet({ onSuccess });

    await user.type(screen.getByLabelText('수험번호'), '00123');
    await user.click(screen.getByRole('button', { name: '기록 확인하기' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('00123'));
  });

  it('does not restore trigger focus when a successful lookup closes the sheet', async () => {
    const user = userEvent.setup();
    lookupParticipant.mockResolvedValue({ examNumber: '00123' });

    function SuccessHarness() {
      const [isOpen, setIsOpen] = useState(true);
      const triggerRef = useRef(null);

      return (
        <>
          <button ref={triggerRef} type="button">조회하기</button>
          {isOpen && (
            <ExamLookupSheet
              onClose={() => setIsOpen(false)}
              onSuccess={() => setIsOpen(false)}
              triggerRef={triggerRef}
            />
          )}
        </>
      );
    }

    render(<SuccessHarness />);

    await user.type(screen.getByLabelText('수험번호'), '00123');
    await user.click(screen.getByRole('button', { name: '기록 확인하기' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: '조회하기' })).not.toHaveFocus();
  });

  it('disables submission while the lookup is pending', async () => {
    const user = userEvent.setup();
    let resolveLookup;
    lookupParticipant.mockImplementation(() => new Promise((resolve) => {
      resolveLookup = resolve;
    }));
    renderSheet();

    await user.type(screen.getByLabelText('수험번호'), '00123');
    await user.click(screen.getByRole('button', { name: '기록 확인하기' }));

    expect(screen.getByRole('button', { name: '확인 중' })).toBeDisabled();

    await act(async () => {
      resolveLookup({ examNumber: '00123' });
    });
  });

  it('does not report success when a pending lookup resolves after dismissal', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    let resolveLookup;
    lookupParticipant.mockImplementation(() => new Promise((resolve) => {
      resolveLookup = resolve;
    }));

    function DismissibleSheet() {
      const [isOpen, setIsOpen] = useState(true);
      const triggerRef = useRef(null);

      return (
        <>
          <button ref={triggerRef} type="button">
            내 순위 확인하기
          </button>
          {isOpen && (
            <ExamLookupSheet
              onClose={() => setIsOpen(false)}
              onSuccess={onSuccess}
              triggerRef={triggerRef}
            />
          )}
        </>
      );
    }

    render(<DismissibleSheet />);

    await user.type(screen.getByLabelText('수험번호'), '00123');
    await user.click(screen.getByRole('button', { name: '기록 확인하기' }));
    await user.click(screen.getByRole('button', { name: '닫기' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await act(async () => {
      resolveLookup({ examNumber: '00123' });
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows a not-found message and keeps the submitted number', async () => {
    const user = userEvent.setup();
    lookupParticipant.mockRejectedValue(
      new PasstivalApiError(PasstivalApiError.NOT_FOUND),
    );
    renderSheet();

    const input = screen.getByLabelText('수험번호');
    await user.type(input, '00999');
    await user.click(screen.getByRole('button', { name: '기록 확인하기' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '일치하는 기록을 찾지 못했어요.',
    );
    expect(input).toHaveValue('00999');
  });

  it('offers an explicit retry after a network failure', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    lookupParticipant
      .mockRejectedValueOnce(new PasstivalApiError(PasstivalApiError.NETWORK))
      .mockResolvedValueOnce({ examNumber: '00123' });
    renderSheet({ onSuccess });

    await user.type(screen.getByLabelText('수험번호'), '00123');
    await user.click(screen.getByRole('button', { name: '기록 확인하기' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
    );

    await user.click(screen.getByRole('button', { name: '다시 시도하기' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('00123'));
    expect(lookupParticipant).toHaveBeenCalledTimes(2);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderSheet({ onClose });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('focuses the input, traps focus, and returns focus to the trigger', async () => {
    const user = userEvent.setup();

    function SheetHarness() {
      const [isOpen, setIsOpen] = useState(false);
      const triggerRef = useRef(null);

      return (
        <>
          <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)}>
            내 순위 확인하기
          </button>
          {isOpen && (
            <ExamLookupSheet
              onClose={() => setIsOpen(false)}
              onSuccess={vi.fn()}
              triggerRef={triggerRef}
            />
          )}
        </>
      );
    }

    render(<SheetHarness />);

    const trigger = screen.getByRole('button', { name: '내 순위 확인하기' });
    await user.click(trigger);

    const input = screen.getByLabelText('수험번호');
    expect(input).toHaveFocus();

    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus();

    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: '기록 확인하기' })).toHaveFocus();

    await user.keyboard('{Tab}');
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });
});
