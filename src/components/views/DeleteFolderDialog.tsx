import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';
import type { FolderViewModel } from '../../types';

interface DeleteFolderDialogProps {
  isOpen: boolean;
  folder: FolderViewModel | null;
  onClose: () => void;
  onConfirm: (folderId: string) => Promise<void>;
}

/**
 * DeleteFolderDialog - Modal with confirmation request for folder deletion
 */
const DeleteFolderDialog: React.FC<DeleteFolderDialogProps> = ({
  isOpen,
  folder,
  onClose,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!folder) return;

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(folder.id);
      // Dialog will be closed by parent component after successful deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć folderu. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const flashcardText = folder?.flashcard_count === 1 ? 'fiszkę' : 'fiszek';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Usuń folder
          </DialogTitle>
          <DialogDescription>
            Ta akcja jest nieodwracalna. Zostanie usunięty folder i wszystkie fiszki w nim zawarte.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">
              Folder do usunięcia:
            </h3>
            <p className="text-red-700 mb-1">
              <strong>"{folder?.name}"</strong>
            </p>
            <p className="text-red-600 text-sm">
              Zawiera {folder?.flashcard_count || 0} {flashcardText}
            </p>
          </div>
          
          <p className="text-gray-600 text-sm mt-4">
            Czy na pewno chcesz usunąć ten folder? Wszystkie fiszki w nim zawarte zostaną trwale utracone.
          </p>
        </div>

        {/* Error message from API */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Usuwanie...' : 'Usuń folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFolderDialog;