import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { createMotionVariants } from '../motion';

export function TopBar({ fixed = false, onBack, title = '2026 PASSTIVAL' }) {
  const reduceMotion = useReducedMotion();
  const motionVariants = createMotionVariants(Boolean(reduceMotion));

  return (
    <header className={`top-bar${fixed ? ' top-bar--fixed' : ''}`}>
      <motion.button
        aria-label="뒤로 가기"
        className="top-bar__back"
        onClick={onBack}
        type="button"
        whileTap={motionVariants.press}
      >
        <ArrowLeft aria-hidden="true" size={24} strokeWidth={1.75} />
      </motion.button>
      <p className="top-bar__title">{title}</p>
    </header>
  );
}
