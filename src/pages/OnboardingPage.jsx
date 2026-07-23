import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import passtivalTitle from '../assets/passtival-title.png';
import { ExamLookupSheet } from '../components/ExamLookupSheet';
import { saveExamNumber } from '../storage/examSession';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const lookupTriggerRef = useRef(null);

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
    <main className="onboarding">
      <h1 className="sr-only">PASSTIVAL</h1>
      <img
        alt="BEYOND LIMITS. BEYOND PASS."
        className="onboarding__title"
        height="238"
        src={passtivalTitle}
        width="358"
      />

      <div className="onboarding__actions">
        <button
          className="onboarding__button onboarding__button--primary"
          onClick={() => setIsLookupOpen(true)}
          ref={lookupTriggerRef}
          type="button"
        >
          내 순위 확인하기
        </button>
        <button
          className="onboarding__button onboarding__button--secondary"
          onClick={() => navigate('/top5')}
          type="button"
        >
          TOP 5 순위
        </button>
      </div>

      {isLookupOpen && (
        <ExamLookupSheet
          onClose={() => setIsLookupOpen(false)}
          onSuccess={handleLookupSuccess}
          triggerRef={lookupTriggerRef}
        />
      )}
    </main>
  );
}
