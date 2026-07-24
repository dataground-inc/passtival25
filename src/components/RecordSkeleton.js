import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './RecordSkeleton.css';

export const RecordSkeleton = () => (
  <section aria-busy="true" aria-label="내 기록을 불러오는 중" className="record-skeleton" role="status">
    <span className="sr-only">내 기록을 불러오는 중</span>
    <div className="record-skeleton__rank">
      <Skeleton height={16} width={72} />
      <Skeleton height={24} width={48} />
    </div>
    <div className="record-skeleton__records">
      {Array.from({ length: 5 }).map((_, index) => (
        <div className="record-skeleton__item" data-testid="record-skeleton-item" key={index}>
          <Skeleton height={14} width="44%" />
          <Skeleton height={22} width="60%" />
        </div>
      ))}
    </div>
  </section>
);
