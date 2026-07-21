import { useEffect, useState } from 'react';
import { lookupParticipant } from '../api/passtivalApi';
import { readExamNumber } from '../storage/examSession';

export function PersonalResultPage() {
  const examNumber = readExamNumber();
  const [participant, setParticipant] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    lookupParticipant(examNumber)
      .then((result) => {
        if (isCurrent) {
          setParticipant(result);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setHasError(true);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [examNumber]);

  if (hasError) {
    return <main><p role="alert">Unable to load your result.</p></main>;
  }

  if (!participant) {
    return <main><p role="status">Loading your result...</p></main>;
  }

  return (
    <main>
      <h1>My ranking</h1>
      <p>{participant.name}</p>
      <p>{participant.rank} / {participant.totalCount}</p>
    </main>
  );
}
