import React, { useState } from 'react';
import './BottomSheet.css';

export const BottomSheet = ({ onClose, onSubmit }) => {
    const [examNumber, setExamNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 제출 상태 추가

    const handleSubmit = async () => {
        if (!examNumber.trim()) return;

        setIsSubmitting(true); // ✅ 버튼 비활성화
        try {
            await onSubmit(examNumber);
        } finally {
            setIsSubmitting(false); // ✅ 실패해도 다시 활성화
        }
    };

    return (
        <div className="bottom-sheet-overlay" onClick={onClose}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
                <div>
                    <div className='font-20b'>수험번호</div>
                    <input
                        className='font-16r'
                        type="text"
                        value={examNumber}
                        onChange={(e) => setExamNumber(e.target.value)}
                        placeholder="수험 번호를 입력해주세요"

                    />
                </div>

                <div style={{ marginTop: '0px', display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} className='close-button font-16r'>
                        닫기
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting} // ✅ 비활성화 조건
                        className='cta-button font-16r'
                        style={{
                            opacity: isSubmitting ? 0.6 : 1,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isSubmitting ? '불러오는 중...' : '확인'}
                    </button>
                </div>
            </div>
        </div>
    );
};
