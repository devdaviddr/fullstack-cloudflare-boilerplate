import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`}
    />
  )
}

interface TodoSkeletonProps {
  count?: number
}

export const TodoSkeleton: React.FC<TodoSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-4 border border-gray-200 rounded-md"
        >
          <Skeleton width="w-5" height="h-5" className="flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton width="w-3/4" />
            <Skeleton width="w-1/2" height="h-3" />
          </div>
          <Skeleton width="w-5" height="w-5" className="flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}
