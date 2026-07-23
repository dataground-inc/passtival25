import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import passtivalTitle from '../assets/passtival-title.png';
import { ExamLookupSheet } from '../components/ExamLookupSheet';
import { createMotionVariants } from '../motion';
import { saveExamNumber } from '../storage/examSession';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const lookupTriggerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const motionVariants = createMotionVariants(Boolean(reduceMotion));

  useEffect(() => {
    if (searchParams.get('lookup') !== '1') {
      return;
    }

    setIsLookupOpen(true);

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('lookup');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  function handleLookupSuccess(examNumber) {
    saveExamNumber(examNumber);
    navigate('/my-ranking');
  }

  return (
    <motion.main
      animate="enter"
      className="onboarding"
      initial="initial"
      variants={motionVariants.onboarding}
    >
      <h1 className="sr-only">PASSTIVAL</h1>
      <motion.img
        alt="BEYOND LIMITS. BEYOND PASS."
        className="onboarding__title"
        height="238"
        src={passtivalTitle}
        variants={motionVariants.onboardingItem}
        width="358"
      />

      <motion.div
        className="onboarding__actions"
        variants={motionVariants.onboardingItem}
      >
        <motion.button
          className="onboarding__button onboarding__button--primary"
          onClick={() => setIsLookupOpen(true)}
          ref={lookupTriggerRef}
          type="button"
          whileTap={motionVariants.press}
        >
          내 순위 확인하기
        </motion.button>
        <motion.button
          className="onboarding__button onboarding__button--secondary"
          onClick={() => navigate('/top5')}
          type="button"
          whileTap={motionVariants.press}
        >
          TOP 5 순위
        </motion.button>
      </motion.div>

      <AnimatePresence initial={false}>
        {isLookupOpen && (
          <ExamLookupSheet
            key="exam-lookup-sheet"
            onClose={() => setIsLookupOpen(false)}
            onSuccess={handleLookupSuccess}
            triggerRef={lookupTriggerRef}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}
