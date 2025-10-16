import React, { useState, useEffect } from 'react';
import type { Folder, CreateFlashcardCommand } from '../../types';
import ManualFlashcardForm from '../forms/ManualFlashcardForm';

interface ManualSaveViewProps {
  userId: string;
}

interface ManualSaveViewState {
  folders: Folder[];
  isLoading: boolean;
  error: string | null;
}

const ManualSaveView: React.FC<ManualSaveViewProps> = ({ userId }) => {
  const [state, setState] = useState<ManualSaveViewState>({
    folders: [],
    isLoading: true,
    error: null,
  });

  // Pobierz foldery przy załadowaniu komponentu
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const response = await fetch(`/api/folders?user_id=${userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch folders: ${response.status}`);
        }
        
        const data = await response.json();
        const fetchedFolders = data.data.folders || [];
        setState(prev => ({
          ...prev,
          folders: fetchedFolders || [],
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error fetching folders:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          isLoading: false,
        }));
      }
    };

    fetchFolders();
  }, []);

  // Obsługa tworzenia nowego folderu
  const handleCreateFolder = async (name: string): Promise<Folder> => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          user_id: userId 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.status}`);
      }

      const data = await response.json();
      const newFolder = data.data.folder;

      // Dodaj nowy folder do listy
      setState(prev => ({
        ...prev,
        folders: [...prev.folders, newFolder],
      }));

      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  // Obsługa zapisu fiszki
  const handleSaveFlashcard = async (command: CreateFlashcardCommand): Promise<void> => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error(`Failed to save flashcard: ${response.status}`);
      }

      // Pokaż powiadomienie o sukcesie (implementacja toast będzie później)
      console.log('Flashcard saved successfully');
    } catch (error) {
      console.error('Error saving flashcard:', error);
      throw error;
    }
  };

  if (state.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Wystąpił błąd podczas ładowania
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{state.error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Spróbuj ponownie
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Utwórz nową fiszkę
          </h2>
          <p className="text-gray-600">
            Wprowadź treść dla przodu i tyłu fiszki, a następnie wybierz folder lub utwórz nowy.
          </p>
        </div>
        
        <ManualFlashcardForm
          folders={state.folders}
          isLoading={state.isLoading}
          onSave={handleSaveFlashcard}
          onCreateFolder={handleCreateFolder}
        />
      </div>
    </div>
  );
};

export default ManualSaveView;