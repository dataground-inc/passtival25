import { motion, useReducedMotion } from 'framer-motion';
import { createMotionVariants } from '../motion';

export function AsyncState({ state, onRetry }) {
  const isError = state === 'error';
  const reduceMotion = useReducedMotion();
  const motionVariants = createMotionVariants(Boolean(reduceMotion));

  return (
    <section
      aria-busy={!isError}
      className={`async-state async-state--${state}`}
    >
      <div className="async-state__skeleton" aria-hidden="true">
        <div className="async-state__hero" />
        <div className="async-state__body">
          <div className="async-state__line async-state__line--name" />
          <div className="async-state__line async-state__line--meta" />
          <div className="async-state__rank" />
          <div className="async-state__records" />
        </div>
      </div>

      {isError ? (
        <div className="async-state__message">
          <p role="alert">결과를 불러오지 못했습니다.</p>
          <motion.button
            onClick={onRetry}
            type="button"
            whileTap={motionVariants.press}
          >
            다시 시도
          </motion.button>
        </div>
      ) : (
        <p className="sr-only" role="status">결과를 불러오는 중입니다.</p>
      )}
    </section>
  );
}
