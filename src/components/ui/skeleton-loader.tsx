import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton = ({ className = '', width, height }: SkeletonProps) => {
  return (
    <div
      className={`skeleton rounded-lg ${className}`}
      style={{ width, height }}
    />
  );
};

export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <Skeleton height="200px" className="w-full" />
      <div className="p-6 space-y-4">
        <Skeleton height="24px" className="w-3/4" />
        <Skeleton height="16px" className="w-full" />
        <Skeleton height="16px" className="w-2/3" />
        <div className="flex justify-between items-center">
          <Skeleton height="20px" className="w-1/3" />
          <Skeleton height="32px" className="w-24" />
        </div>
      </div>
    </div>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 text-center">
      <Skeleton height="64px" width="64px" className="mx-auto mb-6 rounded-2xl" />
      <Skeleton height="48px" className="w-20 mx-auto mb-2" />
      <Skeleton height="20px" className="w-32 mx-auto mb-1" />
      <Skeleton height="16px" className="w-24 mx-auto" />
    </div>
  );
};

export const ServiceCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full">
      <Skeleton height="320px" className="w-full" />
      <div className="p-6 space-y-4">
        <Skeleton height="20px" className="w-full" />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton height="20px" width="20px" className="rounded" />
            <Skeleton height="16px" className="w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton height="20px" width="20px" className="rounded" />
            <Skeleton height="16px" className="w-28" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton height="20px" width="20px" className="rounded" />
            <Skeleton height="16px" className="w-24" />
          </div>
        </div>
        <Skeleton height="40px" className="w-full rounded-xl" />
      </div>
    </div>
  );
};

export const TestimonialSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="16px" width="16px" className="rounded" />
        ))}
      </div>
      <Skeleton height="16px" className="w-full mb-2" />
      <Skeleton height="16px" className="w-full mb-2" />
      <Skeleton height="16px" className="w-3/4 mb-4" />
      <div className="flex items-center gap-4">
        <Skeleton height="48px" width="48px" className="rounded-full" />
        <div className="space-y-2">
          <Skeleton height="16px" className="w-24" />
          <Skeleton height="14px" className="w-20" />
        </div>
      </div>
    </div>
  );
};

interface SkeletonLoaderProps {
  type: 'property' | 'stat' | 'service' | 'testimonial';
  count?: number;
  className?: string;
}

export const SkeletonLoader = ({ type, count = 4, className = '' }: SkeletonLoaderProps) => {
  const SkeletonComponent = {
    property: PropertyCardSkeleton,
    stat: StatCardSkeleton,
    service: ServiceCardSkeleton,
    testimonial: TestimonialSkeleton,
  }[type];

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};
