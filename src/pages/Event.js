// src/pages/EventPage.js
import React from 'react';
import AdCarousel from '../components/Carousel';
import { useNavigate } from 'react-router-dom';
import './Event.css';
import { TopNav } from '../components/TopNav';

const EventPage = () => {
    const handleClick = () => {
        // 원하는 이동 또는 동작 추가
        window.location.href = 'https://z-one.kr/membership/naesin?utm_source=offline&utm_medium=qr&utm_campaign=passtival25';
    };
    return (
        <div className="event-page">
            <TopNav />
            <div className="event-section">
                <div className="event-subtitle font-20b" >패스체대입시 X Z-ONE</div>
                <span className="event-title"> 50% 할인받고<br />합격 분석, 모의 지원까지!</span>

                <div className="event-code font-20b">할인 코드 : PASS50</div>
                <div className="event-description font-16r">멤버십 구매 시, 할인 코드를 입력하세요!</div>
                <AdCarousel />
            </div>
            {/* ✅ 하단 플로팅 버튼 */}
            <div className="floating-button-wrapper">
                <button className="floating-button font-16b" onClick={handleClick}>
                    지금 시작하기
                </button>
            </div>
        </div >
    );
};

export default EventPage;
