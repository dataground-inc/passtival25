import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const SkeletonList = () => {
    return (
        <div
            style={{
                width: '100%',
                padding: '0 0',
                marginBottom: '4px',
            }}
        >
            <Skeleton
                height={60}
                width="100%"
                borderRadius={8}
                baseColor="#E4E6F0"
                highlightColor="#0545FF"
            />
        </div>
    );
};
