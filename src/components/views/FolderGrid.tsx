import React from "react";
import type { FolderViewModel } from "../../types";
import FolderCard from "./FolderCard.tsx";
import FolderCardSkeleton from "./FolderCardSkeleton.tsx";

interface FolderGridProps {
  folders: FolderViewModel[];
  isLoading: boolean;
  onEdit: (folderId: string) => void;
  onDelete: (folderId: string) => void;
}

/**
 * FolderGrid - Component responsible for displaying folder grid or Skeleton components during loading
 */
const FolderGrid: React.FC<FolderGridProps> = ({ folders, isLoading, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {isLoading
        ? // Show skeleton cards while loading
          Array.from({ length: 8 }).map((_, index) => <FolderCardSkeleton key={`skeleton-${index}`} />)
        : // Show actual folder cards
          folders.map((folder) => <FolderCard key={folder.id} folder={folder} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
};

export default FolderGrid;
