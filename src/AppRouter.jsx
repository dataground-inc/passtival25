import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { createMotionVariants } from './motion';
import { OnboardingPage } from './pages/OnboardingPage';
import { PersonalResultPage } from './pages/PersonalResultPage';
import { TopFivePage } from './pages/TopFivePage';
import { readExamNumber } from './storage/examSession';

function PersonalResultRoute() {
  if (!readExamNumber()) {
    return <Navigate replace to="/?lookup=1" />;
  }

  return <PersonalResultPage />;
}

export default function AppRouter() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const motionVariants = createMotionVariants(Boolean(reduceMotion));

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        animate="enter"
        className="route-frame"
        exit="exit"
        initial="initial"
        key={location.pathname}
        variants={motionVariants.page}
      >
        <Routes location={location}>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/my-ranking" element={<PersonalResultRoute />} />
          <Route path="/top5" element={<TopFivePage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
