import "./ButtonFloat.css"

export const ButtonFloat = ({ onClick }) => {
  return (
    <button className="button-float" onClick={onClick}>
      <div className="button-title">내 순위 확인하기</div>
    </button>
  );
};
