import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MyRankingPage } from './pages/MyRankingPage';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import EventPage from './pages/Event';
import NProgress from './nprogress'; // nprogress utils 파일

// ✅ location 변경 감지해서 nprogress 실행
const ProgressRouter = ({ setUserData, userData }) => {
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
      <Route path="/" element={<App setUserData={setUserData} />} />
      <Route path="/my-ranking" element={<MyRankingPage userData={userData} />} />
      <Route path="/event" element={<EventPage />} />
    </Routes>
  );
};

const Root = () => {
  const [userData, setUserData] = useState(null);

  return (
    <BrowserRouter basename="/passtival25">
      <ProgressRouter setUserData={setUserData} userData={userData} />
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
