import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CharacterCounter from "@/components/ui/CharacterCounter";
import type { FlashcardViewModel, UpdateFlashcardCommand } from "../../types";

interface EditFlashcardDialogProps {
  isOpen: boolean;
  flashcard: FlashcardViewModel | null;
  onClose: () => void;
  onSave: (flashcardId: string, command: UpdateFlashcardCommand) => void;
}

interface FormData {
  front: string;
  back: string;
}

interface FormErrors {
  front?: string;
  back?: string;
}

const EditFlashcardDialog: React.FC<EditFlashcardDialogProps> = ({ isOpen, flashcard, onClose, onSave }) => {
  const [formData, setFormData] = useState<FormData>({
    front: "",
    back: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants for validation
  const FRONT_MAX_LENGTH = 200;
  const BACK_MAX_LENGTH = 500;

  // Reset form when flashcard changes
  useEffect(() => {
    if (flashcard) {
      setFormData({
        front: flashcard.front,
        back: flashcard.back,
      });
      setErrors({});
    } else {
      setFormData({
        front: "",
        back: "",
      });
      setErrors({});
    }
  }, [flashcard]);

  // Real-time validation
  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case "front":
        if (!value.trim()) {
          return "Przód fiszki jest wymagany";
        }
        if (value.length > FRONT_MAX_LENGTH) {
          return `Przednia strona musi mieć ${FRONT_MAX_LENGTH} znaków lub mniej`;
        }
        break;
      case "back":
        if (!value.trim()) {
          return "Tył fiszki jest wymagany";
        }
        if (value.length > BACK_MAX_LENGTH) {
          return `Tył musi mieć ${BACK_MAX_LENGTH} znaków lub mniej`;
        }
        break;
    }
    return undefined;
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field if it becomes valid
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.front = validateField("front", formData.front);
    newErrors.back = validateField("back", formData.back);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flashcard || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const command: UpdateFlashcardCommand = {
        front: formData.front.trim(),
        back: formData.back.trim(),
        generation_source: flashcard.generation_source,
      };

      await onSave(flashcard.id, command);
      onClose();
    } catch (error) {
      // Error handling is managed by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Check if form has changes
  const hasChanges =
    flashcard && (formData.front.trim() !== flashcard.front || formData.back.trim() !== flashcard.back);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription>Zmodyfikuj swoją fiszkę. Kliknij zapisz, gdy skończysz.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Front Side */}
          <div className="space-y-2">
            <Label htmlFor="front">
              Przód fiszki <span className="text-red-500">*</span>
            </Label>
            <Input
              id="front"
              value={formData.front}
              onChange={(e) => handleInputChange("front", e.target.value)}
              placeholder="Dodaj przód fiszki"
              className={errors.front ? "border-red-500 focus:border-red-500" : ""}
              disabled={isSubmitting}
              maxLength={FRONT_MAX_LENGTH}
            />
            <div className="flex justify-between items-center">
              {errors.front && <span className="text-sm text-red-600">{errors.front}</span>}
              <div className="ml-auto">
                <CharacterCounter currentLength={formData.front.length} maxLength={FRONT_MAX_LENGTH} />
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="space-y-2">
            <Label htmlFor="back">
              Tył Fiszki <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="back"
              value={formData.back}
              onChange={(e) => handleInputChange("back", e.target.value)}
              placeholder="Dodaj tył fiszki"
              className={errors.back ? "border-red-500 focus:border-red-500" : ""}
              disabled={isSubmitting}
              rows={4}
              maxLength={BACK_MAX_LENGTH}
            />
            <div className="flex justify-between items-center">
              {errors.back && <span className="text-sm text-red-600">{errors.back}</span>}
              <div className="ml-auto">
                <CharacterCounter currentLength={formData.back.length} maxLength={BACK_MAX_LENGTH} />
              </div>
            </div>
          </div>

          {/* Source Info */}
          {flashcard && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Źródło:</span>{" "}
              {flashcard.generation_source === "ai" ? "AI Generated" : "Manual"}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !hasChanges || Object.values(errors).some((error) => error)}
              className="min-w-[80px]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Zapisywanie...
                </>
              ) : (
                "Zapisz zmiany"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFlashcardDialog;
