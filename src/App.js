import React, { useEffect, useState } from 'react';
import './styles/styleguide.css';
import './App.css';
import { RankingList } from './components/RankingList';
import { ButtonFloat } from './components/ButtonFloat';
import { DropdownFilter } from './components/DropdownFilter'; // [수정] 드롭다운 필터 컴포넌트 추가
import './components/DropdownFilter.css'

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

  return (
    <div className="App">
      <div className='adBanner'></div>
      <div className='ranking-section'>
        <div className='top-content'>실시간 순위</div>

        <div className='drop-update'>
          {/* [수정] 드롭다운 필터 적용 */}
          <div className='filter-dropdown'>
            <DropdownFilter
              filters={FILTERS}
              selectedFilter={selectedFilter}
              onChange={setSelectedFilter}
            />
          </div>
          <div className='update'>{lastUpdate}</div></div>

        <div className='list-wrapper'>
          {loading ? (
            <div className='loading-text'>데이터를 불러오는 중이에요🔥</div>
          ) : (
            rankingData.map((item, idx) => (
              <RankingList
                key={idx + 1}
                rank={idx + 1}
                name={item.name}
                center={item.center}
              />
            ))
          )}
        </div>
      </div>
      <ButtonFloat />
    </div >
  );
}

export default App;
