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
    <span className="sr-only">TOP 5 ?쒖쐞瑜?遺덈윭?ㅻ뒗 以?</span>
    <div data-testid="top5-skeleton-row" className="ranking-skeleton__row">
      <Skeleton className="ranking-skeleton__rank" height={36} width={34} />
      <Skeleton className="ranking-skeleton__name" height={20} width="32%" />
      <Skeleton className="ranking-skeleton__center" height={18} width="24%" />
    </div>
  </div>
);
