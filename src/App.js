import React, { useEffect, useState } from 'react';
import EventPage from './pages/Event';
import './styles/styleguide.css';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { RankingList } from './components/RankingList';
import { ButtonFloat } from './components/ButtonFloat';
import { DropdownFilter } from './components/DropdownFilter';
import { SkeletonList } from './components/SkeletonList';
import { BottomSheet } from './components/BottomSheet';
import './components/DropdownFilter.css';


const FILTERS = [
  { key: 'g3_plus_male', label: '고3 이상 남자' },
  { key: 'g3_plus_female', label: '고3 이상 여자' },
  { key: 'g1_g2_male', label: '고2 이하 남자' },
  { key: 'g1_g2_female', label: '고2 이하 여자' },
];

// ✅ 단일 API 주소 사용 (Apps Script에서 mode로 분기)
const API_BASE = 'https://script.google.com/macros/s/AKfycbyF-RbM0MxCE06sFEw7sorYw_u_fZlxd5-5omQikP9dZRUCTLybF_K6T1TeC1m2sjUY/exec';

function App({ setUserData }) {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0].key);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const navigate = useNavigate();

  // ✅ 수험번호 입력 후 유저 정보 API 호출
  const handleExamSubmit = async (examNumber) => {
    try {
      const res = await fetch(`${API_BASE}?mode=exam&examNumber=${examNumber}`);
      const data = await res.json();
      if (data.error) {
        alert('수험번호를 찾을 수 없습니다.');
        return;
      }
      setUserData(data); // ✅ 부모에게 상태 전달
      navigate('/my-ranking');
    } catch (err) {
      alert('데이터 조회에 실패했습니다.');
    }
  };

  // ✅ Top5 랭킹 API 호출
  useEffect(() => {
    async function fetchRankingData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}?mode=top5&filter=${selectedFilter}`);
        const data = await res.json();
        console.log('Top5 응답:', data);

        console.log("✅ 전체 응답 데이터:", data);
        console.log("✅ data.result 확인:", data.result);
        console.log("✅ data.result가 배열인가?", Array.isArray(data.result));

        // 응답 형식에 따라 처리
        if (Array.isArray(data.result)) {
          setRankingData(data.result);
        } else {
          console.error("Top5 응답 형식이 배열이 아닙니다", data);
          setRankingData([]); // 안전하게 초기화
        }

        const now = new Date();
        setLastUpdate(`${now.getHours()}시 ${now.getMinutes()}분 기준`);
      } catch (error) {
        console.error('랭킹 데이터를 불러오지 못했습니다:', error);
        setRankingData([]);
      }
      setLoading(false);
    }

    fetchRankingData();
  }, [selectedFilter]);


  return (
    <div className="App">
      <div className='adBanner'>
        <a href="/passtival25/event"
          target="_blank"
          rel="noopener noreferrer">
          <img src='https://github.com/dataground-inc/passtival25/blob/main/adBanner2.png?raw=true'></img>
        </a>
      </div>

      <div className='ranking-section'>
        <div className='top-content'>실시간 순위</div>

        <div className='drop-update'>
          <div className='filter-dropdown'>
            <DropdownFilter
              filters={FILTERS}
              selectedFilter={selectedFilter}
              onChange={setSelectedFilter}
            />
          </div>
          <div className='update'>{lastUpdate}</div>
        </div>

        <div className='list-wrapper'>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonList key={i} />)
            : rankingData.map((item, idx) => (
              <RankingList
                key={idx + 1}
                rank={idx + 1}
                name={item.name}
                center={item.center}
              />
            ))}
        </div>
      </div>

      {showBottomSheet && (
        <BottomSheet
          onClose={() => setShowBottomSheet(false)}
          onSubmit={handleExamSubmit}
        />
      )}
      <ButtonFloat onClick={() => setShowBottomSheet(true)} />
    </div>
  );
}

export default App;
