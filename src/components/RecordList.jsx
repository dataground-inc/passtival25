import { motion, useReducedMotion } from 'framer-motion';
import { createMotionVariants } from '../motion';
import { formatDisplayValue } from '../utils/displayValue';

const RECORDS = [
  ['standingLongJump', '제자리멀리뛰기'],
  ['backStrength', '배근력'],
  ['shuttleRun10m', '10m왕복달리기'],
  ['medicineBall', '메디신볼던지기'],
  ['sitAndReach', '좌전굴(선택)'],
];

export function RecordList({ records = {} }) {
  const reduceMotion = useReducedMotion();
  const motionVariants = createMotionVariants(Boolean(reduceMotion));

  return (
    <section className="record-list" aria-labelledby="record-list-title">
      <h2 id="record-list-title">기록</h2>
      <motion.dl
        animate="visible"
        initial="hidden"
        variants={motionVariants.list}
      >
        {RECORDS.map(([key, label]) => (
          <motion.div
            className="record-list__row"
            key={key}
            role="group"
            variants={motionVariants.item}
          >
            <dt>{label}</dt>
            <dd>{formatDisplayValue(records[key])}</dd>
          </motion.div>
        ))}
      </motion.dl>
    </section>
  );
}
