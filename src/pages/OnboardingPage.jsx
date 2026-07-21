import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { lookupParticipant } from '../api/passtivalApi';
import { saveExamNumber } from '../storage/examSession';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [examNumber, setExamNumber] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('lookup') !== '1') {
      return;
    }

    setIsLookupOpen(true);

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('lookup');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedExamNumber = examNumber.trim();
    if (!trimmedExamNumber) {
      setError('\uC218\uD5D8\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await lookupParticipant(trimmedExamNumber);
      saveExamNumber(trimmedExamNumber);
      navigate('/my-ranking');
    } catch {
      setError('\uC218\uD5D8\uBC88\uD638\uB97C \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <h1>PASSTIVAL</h1>
      <button type="button" onClick={() => setIsLookupOpen(true)}>
        {'\uB0B4 \uC21C\uC704 \uC870\uD68C'}
      </button>

      {isLookupOpen && (
        <section aria-labelledby="exam-number-heading" aria-modal="true" role="dialog">
          <h2 id="exam-number-heading">{'\uC218\uD5D8\uBC88\uD638 \uC785\uB825'}</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="exam-number">{'\uC218\uD5D8\uBC88\uD638'}</label>
            <input
              autoComplete="off"
              id="exam-number"
              onChange={(event) => setExamNumber(event.target.value)}
              type="text"
              value={examNumber}
            />
            {error && <p role="alert">{error}</p>}
            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? '\uC870\uD68C \uC911' : '\uC870\uD68C'}
            </button>
            <button type="button" onClick={() => setIsLookupOpen(false)}>
              {'\uB2EB\uAE30'}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
