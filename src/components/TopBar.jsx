export function TopBar({ onBack, title = '2026 PASSTIVAL' }) {
  return (
    <header className="top-bar">
      <button
        aria-label="뒤로 가기"
        className="top-bar__back"
        onClick={onBack}
        type="button"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <p className="top-bar__title">{title}</p>
    </header>
  );
}
