// components/BottomSheet.js
import React, { useState } from 'react';
import './BottomSheet.css';

export const BottomSheet = ({ onClose, onSubmit }) => {
    const [examNumber, setExamNumber] = useState('');

    const handleSubmit = () => {
        onSubmit(examNumber);
    };

    return (
        <div className="bottom-sheet-overlay" onClick={onClose}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
                <div>
                    <div className='font-20b'>수험번호</div>
                    <input className='font-16r'
                        type="text"
                        value={examNumber}
                        onChange={(e) => setExamNumber(e.target.value)}
                        placeholder="수험 번호를 입력해주세요"
                    /></div>

                <div style={{ marginTop: '0px', display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} className='close-button font-16r'>
                        닫기
                    </button>
                    <button onClick={handleSubmit} className='cta-button font-16b'>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};
