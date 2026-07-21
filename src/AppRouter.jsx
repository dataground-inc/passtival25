import { Navigate, Route, Routes } from 'react-router-dom';
import { OnboardingPage } from './pages/OnboardingPage';
import { PersonalResultPage } from './pages/PersonalResultPage';
import { TopFivePage } from './pages/TopFivePage';
import { readExamNumber } from './storage/examSession';

function PersonalResultRoute() {
  if (!readExamNumber()) {
    return <Navigate replace to="/?lookup=1" />;
  }

  return <PersonalResultPage />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<OnboardingPage />} />
      <Route path="/my-ranking" element={<PersonalResultRoute />} />
      <Route path="/top5" element={<TopFivePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
