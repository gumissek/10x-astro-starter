import React from 'react';
import { useDashboardState } from '../hooks/useDashboardState';
import { Button } from '../ui/button';
import FolderGrid from './FolderGrid.tsx';
import EditFolderDialog from './EditFolderDialog.tsx';
import DeleteFolderDialog from './DeleteFolderDialog.tsx';

/**
 * DashboardView - Main container for the dashboard page
 * Manages state, fetches data, and coordinates interactions between child components
 */
const DashboardView: React.FC = () => {
  const {
    folders,
    isLoading,
    error,
    editingFolder,
    deletingFolder,
    handleRefresh,
    handleEditFolder,
    handleDeleteFolder,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handleSaveFolder,
    handleConfirmDelete,
  } = useDashboardState();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Twoje foldery</h1>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/generate">
              <Button 
                size="lg"
                className="w-full sm:w-auto"
              >
                Generuj fiszki
              </Button>
            </a>
            <a href="/manual-save">
              <Button 
                size="lg"
                variant="outline" 
                className="w-full sm:w-auto">
                Dodaj fiszkę
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {error ? (
          /* Error State */
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Wystąpił błąd
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Spróbuj ponownie
              </Button>
            </div>
          </div>
        ) : folders.length === 0 && !isLoading ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Nie masz jeszcze żadnych folderów
              </h2>
              <p className="text-gray-500 mb-6">
                Rozpocznij od wygenerowania fiszek lub dodania pierwszej fiszki ręcznie.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/generate">
                  <Button className="w-full sm:w-auto">
                    Generuj pierwsze fiszki
                  </Button>
                </a>
                <a href="/manual-save">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Dodaj fiszkę ręcznie
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Folder Grid */
          <FolderGrid
            folders={folders}
            isLoading={isLoading}
            onEdit={handleEditFolder}
            onDelete={handleDeleteFolder}
          />
        )}
      </main>

      {/* Edit Folder Dialog */}
      <EditFolderDialog
        isOpen={!!editingFolder}
        folder={editingFolder}
        onClose={handleCloseEditDialog}
        onSave={handleSaveFolder}
      />

      {/* Delete Folder Dialog */}
      <DeleteFolderDialog
        isOpen={!!deletingFolder}
        folder={deletingFolder}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default DashboardView;