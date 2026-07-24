import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MyRankingPage } from './pages/MyRankingPage';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import EventPage from './pages/Event';
import NProgress from './nprogress'; // nprogress utils 파일

// ✅ location 변경 감지해서 nprogress 실행
const ProgressRouter = ({ recordLoading, setRecordLoading, setUserData, userData }) => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 700);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<App setRecordLoading={setRecordLoading} setUserData={setUserData} />} />
      <Route path="/my-ranking" element={<MyRankingPage isLoading={recordLoading} userData={userData} />} />
      <Route path="/event" element={<EventPage />} />
    </Routes>
  );
};

const Root = () => {
  const [userData, setUserData] = useState(null);
  const [recordLoading, setRecordLoading] = useState(false);

  return (
    <HashRouter>
      <ProgressRouter recordLoading={recordLoading} setRecordLoading={setRecordLoading} setUserData={setUserData} userData={userData} />
    </HashRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
