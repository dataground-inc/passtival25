import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import AppRouter from './AppRouter';
import './index.css';

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <AppRouter />
  </HashRouter>,
);
