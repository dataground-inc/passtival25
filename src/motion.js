const EMPHASIZED_EASE = [0.22, 1, 0.36, 1];

export function createMotionVariants(reduceMotion) {
  const pageEnterTransition = reduceMotion
    ? { duration: 0.12, ease: 'linear' }
    : { duration: 0.2, ease: EMPHASIZED_EASE };
  const pageExitTransition = reduceMotion
    ? { duration: 0.1, ease: 'linear' }
    : { duration: 0.16, ease: EMPHASIZED_EASE };
  const itemTransition = reduceMotion
    ? { duration: 0.1, ease: 'linear' }
    : { duration: 0.2, ease: EMPHASIZED_EASE };

  return {
    page: {
      initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
      enter: { opacity: 1, y: 0, transition: pageEnterTransition },
      exit: {
        opacity: 0,
        y: reduceMotion ? 0 : -8,
        transition: pageExitTransition,
      },
    },
    backdrop: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: reduceMotion ? 0.1 : 0.18 },
      },
      exit: {
        opacity: 0,
        transition: { duration: reduceMotion ? 0.1 : 0.16 },
      },
    },
    sheet: {
      hidden: {
        opacity: 0,
        scale: reduceMotion ? 1 : 0.985,
        y: reduceMotion ? 0 : 24,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: reduceMotion
          ? { duration: 0.12, ease: 'linear', type: 'tween' }
          : { damping: 34, mass: 0.8, stiffness: 380, type: 'spring' },
      },
      exit: {
        opacity: 0,
        scale: reduceMotion ? 1 : 0.99,
        y: reduceMotion ? 0 : 18,
        transition: {
          duration: reduceMotion ? 0.1 : 0.18,
          ease: reduceMotion ? 'linear' : EMPHASIZED_EASE,
          type: 'tween',
        },
      },
    },
    onboarding: {
      initial: { opacity: 1 },
      enter: {
        opacity: 1,
        transition: {
          delayChildren: reduceMotion ? 0 : 0.08,
          staggerChildren: reduceMotion ? 0 : 0.08,
        },
      },
    },
    onboardingItem: {
      initial: {
        opacity: 0,
        y: reduceMotion ? 0 : 12,
      },
      enter: {
        opacity: 1,
        y: 0,
        transition: itemTransition,
      },
    },
    list: {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: {
          delayChildren: reduceMotion ? 0 : 0.04,
          staggerChildren: reduceMotion ? 0 : 0.055,
        },
      },
    },
    item: {
      hidden: {
        opacity: 0,
        y: reduceMotion ? 0 : 10,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: itemTransition,
      },
    },
    press: {
      scale: reduceMotion ? 1 : 0.98,
      transition: { duration: reduceMotion ? 0 : 0.1 },
    },
    tabIndicator: reduceMotion
      ? { duration: 0 }
      : { damping: 34, stiffness: 420, type: 'spring' },
  };
}
