import React, { useEffect, useState } from 'react';
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

const API_BASE_RANKING = 'https://script.google.com/macros/s/AKfycbxc4mTVfjJGKHt9K7OHTOxblNtOKt_Huiq_K9c14W16FWns0Dhxhwew5HCoSsO34bgM/exec';

function App({ setUserData }) {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0].key);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const navigate = useNavigate(); // ✅ 이제 사용 가능

  const handleExamSubmit = async (examNumber) => {
    try {
      const res = await fetch(`https://script.google.com/macros/s/AKfycbyZelybkcXXk9yrOOQ4Vx9GQFtN4aOd_BJ2XGKqAYLLNJ3B9t1AK_eKQlmiil0tvjFn/exec?examNumber=${examNumber}`);
      const data = await res.json();
      if (data.error) {
        alert('수험번호를 찾을 수 없습니다.');
        return;
      }
      setUserData(data); // 전역으로 상태 설정
      navigate('/my-ranking');
    } catch (err) {
      alert('데이터 조회에 실패했습니다.');
    }
  };

  useEffect(() => {
    async function fetchRankingData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_RANKING}?filter=${selectedFilter}`);
        const data = await res.json();
        setRankingData(data);
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        setLastUpdate(`${hour}시 ${minute}분 기준`);
      } catch (error) {
        console.error('랭킹 데이터를 불러오지 못했습니다:', error);
      }
      setLoading(false);
    }

    fetchRankingData();
  }, [selectedFilter]);

  return (
    <div className="App">
      <div className='adBanner'></div>
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
