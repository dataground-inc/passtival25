import { motion, useReducedMotion } from 'framer-motion';
import { createMotionVariants } from '../motion';

export function TopBar({ onBack, title = '2026 PASSTIVAL' }) {
  const reduceMotion = useReducedMotion();
  const motionVariants = createMotionVariants(Boolean(reduceMotion));

  return (
    <header className="top-bar">
      <motion.button
        aria-label="뒤로 가기"
        className="top-bar__back"
        onClick={onBack}
        type="button"
        whileTap={motionVariants.press}
      >
        <span aria-hidden="true">‹</span>
      </motion.button>
      <p className="top-bar__title">{title}</p>
    </header>
  );
}
