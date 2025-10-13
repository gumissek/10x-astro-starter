import React, { useState } from 'react';
import type { Folder, CreateFlashcardCommand } from '../../types';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import FolderSelectManual from '../ui/FolderSelectManual';
import CharacterCounter from '../ui/CharacterCounter';

interface ManualFlashcardFormViewModel {
  front: string;
  back: string;
  folderId: string | null;
  newFolderName: string;
}

interface ManualFlashcardFormProps {
  folders: Folder[];
  isLoading: boolean;
  onSave: (command: CreateFlashcardCommand) => Promise<void>;
  onCreateFolder: (name: string) => Promise<Folder>;
}

interface ValidationErrors {
  front?: string;
  back?: string;
  folder?: string;
}

const ManualFlashcardForm: React.FC<ManualFlashcardFormProps> = ({
  folders,
  isLoading,
  onSave,
  onCreateFolder,
}) => {
  const [formData, setFormData] = useState<ManualFlashcardFormViewModel>({
    front: '',
    back: '',
    folderId: null,
    newFolderName: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Walidacja pól formularza
  const validateField = (field: keyof ManualFlashcardFormViewModel, value: string): string | undefined => {
    switch (field) {
      case 'front':
        if (!value.trim()) {
          return 'Treść przodu fiszki jest wymagana';
        }
        if (value.length > 200) {
          return 'Treść przodu nie może przekraczać 200 znaków';
        }
        return undefined;
      
      case 'back':
        if (!value.trim()) {
          return 'Treść tyłu fiszki jest wymagana';
        }
        if (value.length > 500) {
          return 'Treść tyłu nie może przekraczać 500 znaków';
        }
        return undefined;
      
      default:
        return undefined;
    }
  };

  // Sprawdź czy formularz jest valid
  const isFormValid = (): boolean => {
    const frontValid = formData.front.trim().length > 0 && formData.front.length <= 200;
    const backValid = formData.back.trim().length > 0 && formData.back.length <= 500;
    const folderValid = formData.folderId !== null;
    
    return frontValid && backValid && folderValid;
  };

  // Obsługa zmiany wartości pól
  const handleFieldChange = (field: keyof ManualFlashcardFormViewModel, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Walidacja w czasie rzeczywistym
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error,
    }));
    
    // Wyczyść błąd zapisu przy zmianie danych
    if (saveError) {
      setSaveError(null);
    }
  };

  // Obsługa wyboru folderu
  const handleFolderSelect = (folderId: string) => {
    setFormData(prev => ({ ...prev, folderId }));
    setValidationErrors(prev => ({ ...prev, folder: undefined }));
  };

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const command: CreateFlashcardCommand = {
        front: formData.front.trim(),
        back: formData.back.trim(),
        folder_id: formData.folderId!,
        generation_source: 'manual',
      };
      
      await onSave(command);
      
      // Wyczyść formularz po pomyślnym zapisie
      setFormData({
        front: '',
        back: '',
        folderId: null,
        newFolderName: '',
      });
      
      // Pokaż powiadomienie o sukcesie (do implementacji później)
      console.log('Fiszka została pomyślnie zapisana');
      
    } catch (error) {
      console.error('Error saving flashcard:', error);
      setSaveError(
        error instanceof Error 
          ? error.message 
          : 'Wystąpił błąd podczas zapisywania fiszki'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pole przód fiszki */}
      <div className="space-y-2">
        <Label htmlFor="front">Przód fiszki</Label>
        <Textarea
          id="front"
          value={formData.front}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('front', e.target.value)}
          placeholder="Wprowadź treść przodu fiszki..."
          className={validationErrors.front ? 'border-red-500' : ''}
          rows={3}
        />
        <div className="flex justify-between items-center">
          <CharacterCounter 
            currentLength={formData.front.length} 
            maxLength={200} 
          />
          {validationErrors.front && (
            <span className="text-sm text-red-600">{validationErrors.front}</span>
          )}
        </div>
      </div>

      {/* Pole tył fiszki */}
      <div className="space-y-2">
        <Label htmlFor="back">Tył fiszki</Label>
        <Textarea
          id="back"
          value={formData.back}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('back', e.target.value)}
          placeholder="Wprowadź treść tyłu fiszki..."
          className={validationErrors.back ? 'border-red-500' : ''}
          rows={4}
        />
        <div className="flex justify-between items-center">
          <CharacterCounter 
            currentLength={formData.back.length} 
            maxLength={500} 
          />
          {validationErrors.back && (
            <span className="text-sm text-red-600">{validationErrors.back}</span>
          )}
        </div>
      </div>

      {/* Wybór folderu */}
      <div className="space-y-2">
        <Label htmlFor="folder">Folder</Label>
        <FolderSelectManual
          folders={folders}
          selectedFolderId={formData.folderId}
          onSelect={handleFolderSelect}
          onCreateFolder={onCreateFolder}
          disabled={isLoading}
        />
        {validationErrors.folder && (
          <span className="text-sm text-red-600">{validationErrors.folder}</span>
        )}
      </div>

      {/* Błąd zapisu */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}

      {/* Przycisk zapisu */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isFormValid() || isSaving || isLoading}
          className="min-w-[120px]"
        >
          {isSaving ? 'Zapisywanie...' : 'Zapisz fiszkę'}
        </Button>
      </div>
    </form>
  );
};

export default ManualFlashcardForm;