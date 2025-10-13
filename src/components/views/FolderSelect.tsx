import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Folder } from '@/types';

interface FolderSelectProps {
  folders: Folder[];
  selectedFolderId: string;
  customFolderName: string;
  suggestedFolderName: string;
  onFolderSelect: (folderId: string) => void;
  onCustomFolderNameChange: (name: string) => void;
  disabled?: boolean;
}

const FolderSelect: React.FC<FolderSelectProps> = ({
  folders = [], // Default to empty array if folders is undefined
  selectedFolderId,
  customFolderName,
  suggestedFolderName,
  onFolderSelect,
  onCustomFolderNameChange,
  disabled = false,
}) => {
  const [mode, setMode] = React.useState<'existing' | 'new'>('new');

  // Ensure folders is always an array
  const safeFolders = Array.isArray(folders) ? folders : [];

  // Reset selection when switching modes
  React.useEffect(() => {
    if (mode === 'new') {
      onFolderSelect('');
    } else {
      onCustomFolderNameChange('');
    }
  }, [mode, onFolderSelect, onCustomFolderNameChange]);

  // Use suggested name when switching to new folder mode
  React.useEffect(() => {
    if (mode === 'new' && customFolderName === '') {
      onCustomFolderNameChange(suggestedFolderName);
    }
  }, [mode, customFolderName, suggestedFolderName, onCustomFolderNameChange]);

  return (
    <div className="space-y-4">
      {/* Mode selection */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={mode === 'new' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('new')}
          disabled={disabled}
        >
          Nowy folder
        </Button>
        <Button
          type="button"
          variant={mode === 'existing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('existing')}
          disabled={disabled || safeFolders.length === 0}
        >
          Istniejący folder
        </Button>
      </div>

      {/* New folder input */}
      {mode === 'new' && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nazwa nowego folderu:
              </label>
              <input
                type="text"
                value={customFolderName}
                onChange={(e) => onCustomFolderNameChange(e.target.value)}
                placeholder="Wprowadź nazwę folderu..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={disabled}
                maxLength={100}
              />
              {suggestedFolderName && customFolderName !== suggestedFolderName && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Sugerowana nazwa: "{suggestedFolderName}"
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onCustomFolderNameChange(suggestedFolderName)}
                    disabled={disabled}
                    className="text-xs"
                  >
                    Użyj sugerowanej
                  </Button>
                </div>
              )}
              <div className="text-xs text-gray-500">
                {customFolderName.length} / 100 znaków
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing folder selection */}
      {mode === 'existing' && (
        <Card>
          <CardContent className="pt-4">
            {safeFolders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Brak dostępnych folderów. Utwórz nowy folder.
              </p>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Wybierz folder:
                </label>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {safeFolders.map((folder) => (
                    <Button
                      key={folder.id}
                      type="button"
                      variant={selectedFolderId === folder.id ? 'default' : 'outline'}
                      className="justify-start text-left"
                      onClick={() => onFolderSelect(folder.id)}
                      disabled={disabled}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{folder.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
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

      {/* Validation message */}
      {mode === 'new' && customFolderName.trim().length === 0 && (
        <p className="text-xs text-red-600">
          Nazwa folderu nie może być pusta
        </p>
      )}
      
      {mode === 'existing' && !selectedFolderId && safeFolders.length > 0 && (
        <p className="text-xs text-red-600">
          Wybierz folder
        </p>
      )}
    </div>
  );
};

export default FolderSelect;