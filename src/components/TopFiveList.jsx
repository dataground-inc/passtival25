import { motion, useReducedMotion } from 'framer-motion';
import { createMotionVariants } from '../motion';

const PLACEHOLDER_COUNT = 5;

export function TopFiveList({ entries = [], isLoading = false }) {
  const reduceMotion = useReducedMotion();
  const motionVariants = createMotionVariants(Boolean(reduceMotion));

  if (isLoading) {
    return (
      <div aria-busy="true" className="top-five-list top-five-list--loading">
        <p className="sr-only" role="status">순위를 불러오는 중입니다.</p>
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
          <div
            aria-hidden="true"
            className="top-five-list__row top-five-list__placeholder"
            data-testid="ranking-placeholder"
            key={index}
          >
            <span className="top-five-list__placeholder-rank" />
            <span className="top-five-list__placeholder-copy">
              <span />
              <span />
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="top-five-list__empty" role="status">
        <span aria-hidden="true">05</span>
        <p>아직 등록된 순위가 없습니다.</p>
      </div>
    );
  }

  return (
    <motion.ol
      animate="visible"
      aria-label="TOP 5 순위"
      className="top-five-list"
      initial="hidden"
      variants={motionVariants.list}
    >
      {entries.map((entry, index) => {
        const rank = index + 1;

        return (
          <motion.li
            className={`top-five-list__row top-five-list__row--rank-${rank}`}
            key={`${entry.name}-${entry.center}-${rank}`}
            variants={motionVariants.item}
          >
            <span aria-label={`${rank}위`} className="top-five-list__rank">
              {rank}
            </span>
            <span className="top-five-list__participant">
              <strong>{entry.name}</strong>
              <span>{entry.center}</span>
            </span>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
