import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import FolderLoadingSpinner from './FolderLoadingSpinner';
import FlashcardList from './FlashcardList';
import EditFlashcardDialog from './EditFlashcardDialog';
import DeleteFlashcardDialog from './DeleteFlashcardDialog';
import { Button } from '@/components/ui/button';
import type { FolderViewModel, FlashcardViewModel, Pagination, UpdateFlashcardCommand } from '../../types';

interface FolderViewProps {
  folderId: string;
  userId: string;
}

interface FolderViewState {
  isLoading: boolean;
  error: string | null;
  folder: FolderViewModel | null;
  flashcards: FlashcardViewModel[];
  pagination: Pagination | null;
  editingFlashcard: FlashcardViewModel | null;
  deletingFlashcard: FlashcardViewModel | null;
}

const useFolderState = (folderId: string, userId: string) => {
  const [state, setState] = useState<FolderViewState>({
    isLoading: true,
    error: null,
    folder: null,
    flashcards: [],
    pagination: null,
    editingFlashcard: null,
    deletingFlashcard: null,
  });

  const fetchFolderData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`/api/folders/${folderId}?user_id=${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch folder: ${response.status}`);
      }
      
      const data = await response.json();
      const folderData = data.data;
      setState(prev => ({ ...prev, folder: folderData }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }));
    }
  };

  const fetchFlashcards = async (page: number = 1) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`/api/flashcards?folderId=${folderId}&page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error(`Failed to fetch flashcards: ${response.status}`);
      }
      
      const data = await response.json();

      const flashcardsData = data.data.flashcards;
      const paginationData = data.data.pagination;

      setState(prev => ({ 
        ...prev, 
        flashcards: flashcardsData, 
        pagination: paginationData,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false 
      }));
    }
  };

  const updateFlashcard = async (flashcardId: string, updates: UpdateFlashcardCommand) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update flashcard: ${response.status}`);
      }

      const result = await response.json();
      const updatedFlashcard = result.data || result;
      
      setState(prev => ({
        ...prev,
        flashcards: prev.flashcards.map(card => 
          card.id === flashcardId ? updatedFlashcard : card
        ),
        editingFlashcard: null
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update flashcard' 
      }));
    }
  };

  const deleteFlashcard = async (flashcardId: string) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete flashcard: ${response.status}`);
      }

      setState(prev => ({
        ...prev,
        flashcards: prev.flashcards.filter(card => card.id !== flashcardId),
        deletingFlashcard: null,
        folder: prev.folder ? {
          ...prev.folder,
          flashcard_count: prev.folder.flashcard_count - 1
        } : null
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete flashcard' 
      }));
    }
  };

  const setEditingFlashcard = (flashcard: FlashcardViewModel | null) => {
    setState(prev => ({ ...prev, editingFlashcard: flashcard }));
  };

  const setDeletingFlashcard = (flashcard: FlashcardViewModel | null) => {
    setState(prev => ({ ...prev, deletingFlashcard: flashcard }));
  };

  const changePage = (page: number) => {
    fetchFlashcards(page);
  };

  useEffect(() => {
    fetchFolderData();
    fetchFlashcards();
  }, [folderId, userId]);

  return {
    ...state,
    updateFlashcard,
    deleteFlashcard,
    setEditingFlashcard,
    setDeletingFlashcard,
    changePage,
  };
};

const FolderView: React.FC<FolderViewProps> = ({ folderId, userId }) => {
  const {
    isLoading,
    error,
    folder,
    flashcards,
    pagination,
    editingFlashcard,
    deletingFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setEditingFlashcard,
    setDeletingFlashcard,
    changePage,
  } = useFolderState(folderId, userId);

  if (isLoading && !folder) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <FolderLoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-600">Folder not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{folder.name}</h1>
            <p className="text-gray-600">
              {folder.flashcard_count} {folder.flashcard_count === 1 ? 'fiszka' : 'fiszek'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              size="lg"
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
            >
              ← Powrót na pulpit
            </Button>
            {folder.flashcard_count >= 10 && (
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = `/study/${folderId}`}
              >
                Rozpocznij naukę
              </Button>
            )}
            
          </div>
        </div>
        {folder.flashcard_count > 0 && folder.flashcard_count < 10 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Potrzebujesz co najmniej 10 fiszek, aby rozpocząć sesję nauki. 
              Obecnie masz {folder.flashcard_count} {folder.flashcard_count === 1 ? 'fiszkę' : 'fiszek'}.
            </p>
          </div>
        )}
      </div>

      {/* Flashcards List Section */}
      <FlashcardList
        flashcards={flashcards}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={changePage}
        onEdit={setEditingFlashcard}
        onDelete={setDeletingFlashcard}
      />

      {/* Edit Flashcard Dialog */}
      <EditFlashcardDialog
        isOpen={!!editingFlashcard}
        flashcard={editingFlashcard}
        onClose={() => setEditingFlashcard(null)}
        onSave={updateFlashcard}
      />

      {/* Delete Flashcard Dialog */}
      <DeleteFlashcardDialog
        isOpen={!!deletingFlashcard}
        flashcard={deletingFlashcard}
        onClose={() => setDeletingFlashcard(null)}
        onConfirm={deleteFlashcard}
      />
    </div>
  );
};

export default FolderView;