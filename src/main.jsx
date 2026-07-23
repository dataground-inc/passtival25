import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import AppRouter from './AppRouter';
import './index.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/shared.css';
import './styles/onboarding.css';
import './styles/exam-sheet.css';
import './styles/personal-result.css';

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <AppRouter />
  </HashRouter>,
);
