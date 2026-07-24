import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './SkeletonList.css';

export const SkeletonList = () => (
  <div
    aria-busy="true"
    aria-label="TOP 5 ?쒖쐞瑜?遺덈윭?ㅻ뒗 以?"
    className="ranking-skeleton"
    role="status"
  >
    <div
      data-testid="top5-skeleton-row"
      className="ranking-skeleton__row"
      style={{ background: '#0545FF', height: '60px' }}
    >
      <Skeleton
        baseColor="#E4E6F0"
        className="ranking-skeleton__rank"
        height={36}
        highlightColor="#0545FF"
        width={34}
      />
      <Skeleton
        baseColor="#E4E6F0"
        className="ranking-skeleton__name"
        height={20}
        highlightColor="#0545FF"
        width="32%"
      />
      <Skeleton
        baseColor="#E4E6F0"
        className="ranking-skeleton__center"
        height={18}
        highlightColor="#0545FF"
        width="24%"
      />
    </div>
  </div>
);
