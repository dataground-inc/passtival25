import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PasstivalApiError, lookupParticipant } from '../api/passtivalApi';
import { createMotionVariants } from '../motion';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function ExamLookupSheet({ onClose, onSuccess, triggerRef }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const isMountedRef = useRef(true);
  const [examNumber, setExamNumber] = useState('');
  const [error, setError] = useState('');
  const [isRetryable, setIsRetryable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reduceMotion = useReducedMotion();
  const motionVariants = createMotionVariants(Boolean(reduceMotion));

  function handleClose() {
    isMountedRef.current = false;
    onClose();
  }

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [],
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef?.current?.focus();
    };
  }, [onClose, triggerRef]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedExamNumber = examNumber.trim();
    if (!trimmedExamNumber) {
      setError('수험번호를 입력해 주세요.');
      setIsRetryable(false);
      return;
    }

    setError('');
    setIsRetryable(false);
    setIsSubmitting(true);

    try {
      await lookupParticipant(trimmedExamNumber);
      if (!isMountedRef.current) {
        return;
      }

      setIsSubmitting(false);
      onSuccess(trimmedExamNumber);
    } catch (caughtError) {
      if (!isMountedRef.current) {
        return;
      }

      const isNotFound = caughtError?.code === PasstivalApiError.NOT_FOUND;
      setError(
        isNotFound
          ? '일치하는 기록을 찾지 못했어요.'
          : '기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
      setIsRetryable(!isNotFound);
      setIsSubmitting(false);
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  return (
    <motion.div
      animate="visible"
      className="exam-sheet-backdrop"
      exit="exit"
      initial="hidden"
      onMouseDown={handleBackdropClick}
      variants={motionVariants.backdrop}
    >
      <motion.section
        aria-labelledby="exam-sheet-title"
        aria-modal="true"
        className="exam-sheet"
        ref={dialogRef}
        role="dialog"
        variants={motionVariants.sheet}
      >
        <header className="exam-sheet__header">
          <h2 id="exam-sheet-title">수험번호 입력</h2>
          <motion.button
            className="exam-sheet__close"
            onClick={handleClose}
            type="button"
            whileTap={motionVariants.press}
          >
            닫기
          </motion.button>
        </header>

        <p className="exam-sheet__guidance" id="exam-sheet-guidance">
          참가 신청에 사용한 수험번호를 입력해 주세요.
        </p>

        <form className="exam-sheet__form" onSubmit={handleSubmit}>
          <label htmlFor="exam-number">수험번호</label>
          <input
            aria-describedby="exam-sheet-guidance"
            aria-errormessage={error ? 'exam-sheet-error' : undefined}
            aria-invalid={Boolean(error)}
            autoComplete="off"
            id="exam-number"
            inputMode="numeric"
            onChange={(event) => setExamNumber(event.target.value)}
            ref={inputRef}
            type="text"
            value={examNumber}
          />

          <div className="exam-sheet__feedback">
            {error && (
              <p id="exam-sheet-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <motion.button
            className="exam-sheet__submit"
            disabled={isSubmitting}
            type="submit"
            whileTap={motionVariants.press}
          >
            {isSubmitting ? '확인 중' : isRetryable ? '다시 시도하기' : '기록 확인하기'}
          </motion.button>
        </form>
      </motion.section>
    </motion.div>
  );
}
