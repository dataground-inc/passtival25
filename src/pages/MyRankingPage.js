// src/pages/MyRankingPage.js
import React from 'react';
import './MyRankingPage.css';
import { TopNav } from '../components/TopNav';

export const MyRankingPage = ({ userData }) => {
    if (!userData) {
        return <div className="my-ranking-page">데이터를 불러오는 중입니다...</div>;
    }

    return (
        <div className="my-ranking-page">
            <TopNav />
            <div className="ranking-card">
                <div className='rank-card'>
                    <div className='font-14r'>현재 순위</div>
                    <div className='font-20b'>{userData.rank}위</div>
                </div>
            </div>
            <div className='record-section'>
                <div className='record-box'>
                    <div className='record-item'>
                        <span className='font-12r'>제자리멀리뛰기</span>
                        <span className='font-20b'>{userData.jemul}cm</span>
                    </div>
                    <div className='record-item'>
                        <span className='font-12r'>배근력</span>
                        <span className='font-20b'>{userData.backStrength}kg</span>
                    </div>
                </div>
                <div className='record-box'>
                    <div className='record-item'>
                        <span className='font-12r'>10m 왕복달리기</span>
                        <span className='font-20b'>{userData.run10m}초</span></div>
                    <div className='record-item'>
                        <span className='font-12r'>메디신볼던지기</span>
                        <span className='font-20b'>{userData.medicineBall}m</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
