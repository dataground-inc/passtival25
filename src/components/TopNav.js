import './TopNav.css';
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

export const TopNav = () => {
    const navigate = useNavigate(); // ← 내비게이션 훅 사용

    return (
        <div className='top-frame'>
            <div className='icon-frame' onClick={() => navigate(-1)}>
                <FiArrowLeft size={24} />
            </div>
        </div>
    );
};
