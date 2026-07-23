import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTopFive, GROUPS } from '../api/passtivalApi';
import { RankingTabs } from '../components/RankingTabs';
import { TopBar } from '../components/TopBar';
import { TopFiveList } from '../components/TopFiveList';

export function TopFivePage() {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(GROUPS[0]);
  const [requestAttempt, setRequestAttempt] = useState(0);
  const [requestState, setRequestState] = useState('loading');
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    let isCurrent = true;

    setRequestState('loading');

    fetchTopFive(selectedGroup)
      .then((result) => {
        if (isCurrent) {
          setRankings(result);
          setRequestState('success');
        }
      })
      .catch(() => {
        if (isCurrent) {
          setRequestState('error');
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [requestAttempt, selectedGroup]);

  return (
    <main className="top-five">
      <TopBar onBack={() => navigate('/')} />

      <div className="top-five__content">
        <header className="top-five__heading">
          <p>2026 PASSTIVAL RANKING</p>
          <h1>Top 5</h1>
        </header>

        <RankingTabs
          groups={GROUPS}
          onSelect={setSelectedGroup}
          selectedGroup={selectedGroup}
        />

        <section
          aria-labelledby={`ranking-tab-${GROUPS.indexOf(selectedGroup)}`}
          className="top-five__panel"
          id="top-five-ranking-panel"
          role="tabpanel"
        >
          {requestState === 'error' ? (
            <div className="top-five__error">
              <p role="alert">순위를 불러오지 못했습니다.</p>
              <button
                onClick={() => setRequestAttempt((attempt) => attempt + 1)}
                type="button"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <TopFiveList
              entries={rankings}
              isLoading={requestState === 'loading'}
            />
          )}
        </section>
      </div>
    </main>
  );
}
