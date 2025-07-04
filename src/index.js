import React, { useState } from 'react'; // ✅ useState 추가
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MyRankingPage } from './pages/MyRankingPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EventPage from './pages/Event';


const Root = () => {
  const [userData, setUserData] = useState(null);

  return (
    <BrowserRouter basename="/passtival25">
      <Routes>
        <Route path="/" element={<App setUserData={setUserData} />} />
        <Route path="/my-ranking" element={<MyRankingPage userData={userData} />} />
        <Route path="/event" element={<EventPage />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
