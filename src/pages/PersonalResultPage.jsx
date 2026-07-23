import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lookupParticipant } from '../api/passtivalApi';
import athleteHero from '../assets/athlete-hero.png';
import { AsyncState } from '../components/AsyncState';
import { RecordList } from '../components/RecordList';
import { TopBar } from '../components/TopBar';
import { readExamNumber } from '../storage/examSession';
import { formatDisplayValue } from '../utils/displayValue';

const countFormatter = new Intl.NumberFormat('ko-KR');

function formatCount(value) {
  const numericValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(numericValue)
    ? countFormatter.format(numericValue)
    : String(value ?? '');
}

function formatRank(value) {
  return formatDisplayValue(value, (presentValue) => `${formatCount(presentValue)}위`);
}

function formatTotalCount(value) {
  return formatDisplayValue(
    value,
    (presentValue) => `총 ${formatCount(presentValue)}명 중`,
  );
}

export function PersonalResultPage() {
  const navigate = useNavigate();
  const examNumber = readExamNumber();
  const [requestAttempt, setRequestAttempt] = useState(0);
  const [requestState, setRequestState] = useState('loading');
  const [participant, setParticipant] = useState(null);

  useEffect(() => {
    if (!examNumber) {
      navigate('/?lookup=1', { replace: true });
      return undefined;
    }

    let isCurrent = true;
    setRequestState('loading');

    lookupParticipant(examNumber)
      .then((result) => {
        if (isCurrent) {
          setParticipant(result);
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
  }, [examNumber, navigate, requestAttempt]);

  return (
    <main className="personal-result">
      <TopBar onBack={() => navigate('/')} />

      {requestState !== 'success' || !participant ? (
        <AsyncState
          onRetry={() => setRequestAttempt((attempt) => attempt + 1)}
          state={requestState}
        />
      ) : (
        <>
          <div className="personal-result__visual">
            <img
              alt=""
              className="personal-result__athlete"
              height="600"
              src={athleteHero}
              width="390"
            />
          </div>

          <div className="personal-result__content">
            <section className="personal-result__identity">
              <h1>{formatDisplayValue(participant.name)}</h1>
              <div className="personal-result__metadata" aria-label="참가자 정보">
                <span>{formatDisplayValue(participant.center)}</span>
                <span>{formatDisplayValue(participant.grade)}</span>
                <span>{formatDisplayValue(participant.gender)}</span>
                <span>{formatDisplayValue(participant.group)}</span>
                <span className="personal-result__exam-number">
                  <span>수험번호</span>
                  <span>{formatDisplayValue(participant.examNumber)}</span>
                </span>
              </div>
            </section>

            <section className="personal-result__ranking" aria-labelledby="current-rank">
              <div>
                <p id="current-rank">현재 순위</p>
                <strong>{formatRank(participant.rank)}</strong>
              </div>
              <p>{formatTotalCount(participant.totalCount)}</p>
            </section>

            <RecordList records={participant.records} />
            <p className="personal-result__guidance">
              실기 기록이 잘못되었다면 근처 기록 작성 스태프에게 문의해 주세요.
            </p>
          </div>
        </>
      )}
    </main>
  );
}
