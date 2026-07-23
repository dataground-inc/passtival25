import { useRef } from 'react';

export function RankingTabs({ groups, onSelect, selectedGroup }) {
  const tabRefs = useRef([]);

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

          return (
            <button
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
            >
              {group}
            </button>
          );
        })}
      </div>
    </div>
  );
}
