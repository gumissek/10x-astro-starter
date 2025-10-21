import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { FolderViewModel } from "../../types";

interface EditFolderDialogProps {
  isOpen: boolean;
  folder: FolderViewModel | null;
  onClose: () => void;
  onSave: (folderId: string, newName: string) => Promise<void>;
}

/**
 * EditFolderDialog - Modal with form for editing existing folder name
 */
const EditFolderDialog: React.FC<EditFolderDialogProps> = ({ isOpen, folder, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes or folder changes
  useEffect(() => {
    if (isOpen && folder) {
      setName(folder.name);
      setError(null);
    } else {
      setName("");
      setError(null);
    }
  }, [isOpen, folder]);

  // Validation logic
  const trimmedName = name.trim();
  const isNameEmpty = trimmedName.length === 0;
  const isNameTooLong = trimmedName.length > 100;
  const isNameUnchanged = folder && trimmedName === folder.name;
  const isFormValid = !isNameEmpty && !isNameTooLong && !isNameUnchanged;

  const getValidationMessage = (): string | null => {
    if (isNameEmpty) return "Nazwa folderu jest wymagana";
    if (isNameTooLong) return "Nazwa folderu nie może przekraczać 100 znaków";
    if (isNameUnchanged) return "Wprowadź nową nazwę dla folderu";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folder || !isFormValid) return;

    setIsLoading(true);
    setError(null);

    try {
      await onSave(folder.id, trimmedName);
      // Dialog will be closed by parent component after successful save
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się zapisać zmian. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edytuj folder</DialogTitle>
          <DialogDescription>
            Zmień nazwę folderu &quot;{folder?.name}&quot;. Zmiany zostaną zapisane automatycznie.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Nazwa folderu</Label>
              <Input
                id="folder-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="Wprowadź nazwę folderu"
                maxLength={100}
              />
              {/* Character counter */}
              <div className="text-xs text-gray-500 text-right">{trimmedName.length}/100 znaków</div>

              {/* Validation message */}
              {getValidationMessage() && <p className="text-sm text-red-600">{getValidationMessage()}</p>}
            </div>
          </div>

          {/* Error message from API */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Anuluj
            </Button>
            <Button type="submit" disabled={!isFormValid || isLoading}>
              {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFolderDialog;
