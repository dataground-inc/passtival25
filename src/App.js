import React, { useEffect, useState } from 'react';
import './styles/styleguide.css';
import './App.css';
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

const API_BASE = 'https://script.google.com/macros/s/AKfycbxc4mTVfjJGKHt9K7OHTOxblNtOKt_Huiq_K9c14W16FWns0Dhxhwew5HCoSsO34bgM/exec';

function App() {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0].key);
  const [showBottomSheet, setShowBottomSheet] = useState(false); // ✅ 바텀시트 상태 추가

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}?filter=${selectedFilter}`);
        const data = await res.json();
        setRankingData(data);

        const now = new Date();
        setLastUpdate(`${now.getHours()}시 ${now.getMinutes()}분 기준`);
      } catch (error) {
        alert('데이터를 불러오지 못했습니다.');
        console.error(error);
      }
      setLoading(false);
    }
    fetchData();
  }, [selectedFilter]);

  const handleExamSubmit = (examNumber) => {
    console.log('입력한 수험번호:', examNumber);
    // 여기에 추후 API 호출 추가
    setShowBottomSheet(false);
  };

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

      {/* ✅ 바텀시트 조건부 렌더링 */}
      {showBottomSheet && (
        <BottomSheet
          onClose={() => setShowBottomSheet(false)}
          onSubmit={handleExamSubmit}
        />
      )}

      {/* ✅ 버튼 클릭 시 바텀시트 열기 */}
      <ButtonFloat onClick={() => setShowBottomSheet(true)} />
    </div>
  );
}

export default App;
