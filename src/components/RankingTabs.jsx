import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { createMotionVariants } from '../motion';

const GROUP_LABELS = {
  '고3 남자': '고3 이상 남자',
  '고3 여자': '고3 이상 여자',
  '고2 남자': '고2 이하 남자',
  '고2 여자': '고2 이하 여자',
};

export function RankingTabs({ groups, onSelect, selectedGroup }) {
  const tabRefs = useRef([]);
  const reduceMotion = useReducedMotion();
  const motionVariants = createMotionVariants(Boolean(reduceMotion));

  function selectByIndex(index) {
    const nextIndex = (index + groups.length) % groups.length;
    tabRefs.current[nextIndex]?.focus();
    onSelect(groups[nextIndex]);
  }

  function handleKeyDown(event, index) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectByIndex(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectByIndex(index + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectByIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectByIndex(groups.length - 1);
    }
  }

  return (
    <div className="ranking-tabs">
      <div aria-label="순위 그룹" className="ranking-tabs__list" role="tablist">
        {groups.map((group, index) => {
          const isSelected = group === selectedGroup;
          const label = GROUP_LABELS[group] ?? group;

          return (
            <motion.button
              aria-controls="top-five-ranking-panel"
              aria-selected={isSelected}
              className="ranking-tabs__tab"
              id={`ranking-tab-${index}`}
              key={group}
              onClick={() => onSelect(group)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              type="button"
              whileTap={motionVariants.press}
            >
              <span className="ranking-tabs__label">{label}</span>
              {isSelected && (
                <motion.span
                  aria-hidden="true"
                  className="ranking-tabs__indicator"
                  layoutId="active-ranking-tab-indicator"
                  transition={motionVariants.tabIndicator}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
