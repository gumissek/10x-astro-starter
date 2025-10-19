import React from 'react';
import { Button } from '@/components/ui/button';
import FlashcardListItem from './FlashcardListItem';
import LoadingSpinner from './LoadingSpinner';
import type { FlashcardViewModel, Pagination } from '../../types';

interface FlashcardListProps {
  flashcards: FlashcardViewModel[];
  pagination: Pagination | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (flashcard: FlashcardViewModel) => void;
  onDelete: (flashcard: FlashcardViewModel) => void;
}

const PaginationControls: React.FC<{
  pagination: Pagination;
  onPageChange: (page: number) => void;
}> = ({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;

  const { page, totalPages } = pagination;
  
  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center flex-wrap gap-2 mt-8">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-2 sm:px-3 py-2"
      >
        <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Poprzednia</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((pageNum, index) => (
          <React.Fragment key={index}>
            {pageNum === '...' ? (
              <span className="px-2 sm:px-3 py-2 text-gray-500 text-sm">...</span>
            ) : (
              <Button
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
                className="px-2 sm:px-3 py-2 min-w-[36px] sm:min-w-[40px] text-sm"
              >
                {pageNum}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-2 sm:px-3 py-2"
      >
        <span className="hidden sm:inline">Następna</span>
        <svg className="w-4 h-4 sm:ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
};

const FlashcardList: React.FC<FlashcardListProps> = ({
  flashcards,
  pagination,
  isLoading,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Brak fiszek</h3>
        <p className="text-gray-600 text-base mb-4">Ten folder jest pusty.</p>
        <p className="text-gray-500 text-sm">Dodaj nowe fiszki i zacznij naukę!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Flashcards Grid */}
      <div className="space-y-4">
        {flashcards.map((flashcard) => (
          <FlashcardListItem
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Results Info */}
      {pagination && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600 mt-6">
          <div>
            Widok od {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} do {' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total} fiszek w folderze
          </div>
          <div className="text-gray-500">
            Strona {pagination.page} z {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default FlashcardList;