import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

/**
 * FolderCardSkeleton - Skeleton component displayed during folder loading
 */
const FolderCardSkeleton: React.FC = () => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Skeleton className="h-8 w-8 ml-auto" />
      </CardFooter>
    </Card>
  );
};

export default FolderCardSkeleton;