import { describe, expect, it } from 'vitest';
import { createMotionVariants } from './motion';

describe('createMotionVariants', () => {
  it('coordinates restrained page, sheet, list, and press motion', () => {
    const motion = createMotionVariants(false);

    expect(motion.page.initial.y).toBeGreaterThanOrEqual(8);
    expect(motion.page.initial.y).toBeLessThanOrEqual(16);
    expect(motion.page.enter.y).toBe(0);
    expect(motion.page.enter.transition.duration).toBeGreaterThanOrEqual(0.16);
    expect(motion.page.enter.transition.duration).toBeLessThanOrEqual(0.24);
    expect(motion.sheet.visible.transition.type).toBe('spring');
    expect(motion.onboarding.enter.transition.staggerChildren).toBeGreaterThan(0);
    expect(motion.list.visible.transition.staggerChildren).toBeGreaterThan(0);
    expect(motion.press.scale).toBeLessThan(1);
  });

  it('removes spatial, spring, and stagger motion when reduced motion is requested', () => {
    const reduced = createMotionVariants(true);

    expect(reduced.page.initial.y).toBe(0);
    expect(reduced.page.enter.y).toBe(0);
    expect(reduced.page.exit.y).toBe(0);
    expect(reduced.sheet.hidden.y).toBe(0);
    expect(reduced.sheet.hidden.scale).toBe(1);
    expect(reduced.sheet.visible.transition.type).not.toBe('spring');
    expect(reduced.sheet.exit.y).toBe(0);
    expect(reduced.sheet.exit.scale).toBe(1);
    expect(reduced.onboarding.enter.transition.staggerChildren).toBe(0);
    expect(reduced.list.visible.transition.staggerChildren).toBe(0);
    expect(reduced.item.hidden.y).toBe(0);
    expect(reduced.press.scale).toBe(1);
    expect(reduced.page.enter.transition.duration).toBeGreaterThan(0);
    expect(reduced.page.enter.transition.duration).toBeLessThanOrEqual(0.16);
  });
});
