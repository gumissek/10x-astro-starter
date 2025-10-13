import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Input } from './input';
import { Label } from './label';
import type { Folder } from '../../types';

interface FolderSelectProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelect: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<Folder>;
  disabled?: boolean;
}

const FolderSelectManual: React.FC<FolderSelectProps> = ({
  folders = [],
  selectedFolderId,
  onSelect,
  onCreateFolder,
  disabled = false,
}) => {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Bezpieczna lista folderów
  const safeFolders = Array.isArray(folders) ? folders : [];

  // Obsługa tworzenia nowego folderu
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const newFolder = await onCreateFolder(newFolderName.trim());
      console.log('Created folder:', newFolder);
      onSelect(newFolder.id);
      setNewFolderName('');
      setMode('existing');
    } catch (error) {
      console.error('Error creating folder:', error);
      setCreateError(
        error instanceof Error 
          ? error.message 
          : 'Wystąpił błąd podczas tworzenia folderu'
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Sprawdź czy nazwa folderu już istnieje
  const folderNameExists = safeFolders.some(
    folder => folder.name.toLowerCase() === newFolderName.trim().toLowerCase()
  );

  // Walidacja nazwy nowego folderu
  const isNewFolderNameValid = newFolderName.trim().length > 0 && 
                              newFolderName.trim().length <= 100 && 
                              !folderNameExists;

  return (
    <div className="space-y-4">
      {/* Przełącznik trybu */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={mode === 'existing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('existing')}
          disabled={disabled || safeFolders.length === 0}
        >
          Wybierz istniejący
        </Button>
        <Button
          type="button"
          variant={mode === 'new' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('new')}
          disabled={disabled}
        >
          Utwórz nowy
        </Button>
      </div>

      {/* Wybór istniejącego folderu */}
      {mode === 'existing' && (
        <Card>
          <CardContent className="pt-4">
            {safeFolders.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">
                  Nie masz jeszcze żadnych folderów.
                </p>
                <Button
                  type="button"
                  onClick={() => setMode('new')}
                  disabled={disabled}
                  size="sm"
                >
                  Utwórz pierwszy folder
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Wybierz folder:</Label>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {safeFolders.map((folder) => (
                    <Button
                      key={folder.id}
                      type="button"
                      variant={selectedFolderId === folder.id ? 'default' : 'outline'}
                      className="justify-start text-left h-auto py-3"
                      onClick={() => onSelect(folder.id)}
                      disabled={disabled}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate font-medium">{folder.name}</span>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {folder.created_at ? new Date(folder.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tworzenie nowego folderu */}
      {mode === 'new' && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-folder-name">Nazwa nowego folderu:</Label>
                <Input
                  id="new-folder-name"
                  type="text"
                  value={newFolderName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNewFolderName(e.target.value);
                    setCreateError(null);
                  }}
                  placeholder="Wprowadź nazwę folderu..."
                  disabled={disabled || isCreating}
                  maxLength={100}
                  className={folderNameExists ? 'border-red-500' : ''}
                />
                
                {/* Licznik znaków */}
                <div className="flex justify-between items-center text-xs">
                  <span className={newFolderName.length > 100 ? 'text-red-600' : 'text-gray-500'}>
                    {newFolderName.length} / 100 znaków
                  </span>
                </div>

                {/* Błędy walidacji */}
                {folderNameExists && (
                  <p className="text-xs text-red-600">
                    Folder o tej nazwie już istnieje
                  </p>
                )}
                
                {createError && (
                  <p className="text-xs text-red-600">
                    {createError}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMode('existing');
                    setNewFolderName('');
                    setCreateError(null);
                  }}
                  disabled={disabled || isCreating}
                  size="sm"
                >
                  Anuluj
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateFolder}
                  disabled={disabled || isCreating || !isNewFolderNameValid}
                  size="sm"
                >
                  {isCreating ? 'Tworzenie...' : 'Utwórz folder'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Komunikat o braku wyboru dla istniejących folderów */}
      {mode === 'existing' && !selectedFolderId && safeFolders.length > 0 && (
        <p className="text-xs text-red-600">
          Wybierz folder z listy
        </p>
      )}
    </div>
  );
};

export default FolderSelectManual;