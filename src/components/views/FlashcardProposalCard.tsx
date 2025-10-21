import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FlashcardProposalViewModel } from "@/types";

interface FlashcardProposalCardProps {
  proposal: FlashcardProposalViewModel;
  onUpdate: (updatedProposal: FlashcardProposalViewModel) => void;
  disabled?: boolean;
}

const FlashcardProposalCard: React.FC<FlashcardProposalCardProps> = ({ proposal, onUpdate, disabled = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    front: proposal.front,
    back: proposal.back,
  });

  // Handle status changes
  const handleAccept = () => {
    onUpdate({ ...proposal, status: "accepted" });
  };

  const handleReject = () => {
    onUpdate({ ...proposal, status: "rejected" });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      front: proposal.front,
      back: proposal.back,
    });
  };

  // Handle edit form changes
  const handleEditFormChange = (field: "front" | "back", value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save edit
  const handleSaveEdit = () => {
    // Validation
    const trimmedFront = editForm.front.trim();
    const trimmedBack = editForm.back.trim();

    if (trimmedFront.length === 0 || trimmedBack.length === 0) {
      return; // Don't save if empty
    }

    onUpdate({
      ...proposal,
      front: trimmedFront,
      back: trimmedBack,
    });

    setIsEditing(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      front: proposal.front,
      back: proposal.back,
    });
  };

  // Get card styling based on status
  const getCardClassName = () => {
    const baseClasses = "transition-all duration-200";

    switch (proposal.status) {
      case "accepted":
        return `${baseClasses} border-green-200 bg-green-50`;
      case "rejected":
        return `${baseClasses} border-red-200 bg-red-50 opacity-75`;
      default:
        return `${baseClasses} border-gray-200 hover:border-gray-300`;
    }
  };

  // Validation for edit form
  const isEditFormValid =
    editForm.front.trim().length > 0 &&
    editForm.front.length <= 200 &&
    editForm.back.trim().length > 0 &&
    editForm.back.length <= 500;

  return (
    <Card className={getCardClassName()}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${
                proposal.status === "accepted"
                  ? "bg-green-500"
                  : proposal.status === "rejected"
                    ? "bg-red-500"
                    : "bg-gray-300"
              }`}
            />
            <span className="text-sm font-medium capitalize text-gray-700">
              {proposal.status === "pending" && "Oczekuje"}
              {proposal.status === "accepted" && "Zaakceptowana"}
              {proposal.status === "rejected" && "Odrzucona"}
            </span>
          </div>

          {/* Action buttons */}
          {!isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              {proposal.status !== "accepted" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAccept}
                  disabled={disabled}
                  className="w-full sm:w-auto text-green-600 border-green-300 hover:bg-green-50"
                >
                  Akceptuj
                </Button>
              )}

              {proposal.status !== "rejected" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  disabled={disabled}
                  className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50"
                >
                  Odrzuć
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={handleEdit} disabled={disabled} className="w-full sm:w-auto">
                Edytuj
              </Button>
            </div>
          )}

          {/* Edit action buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!isEditFormValid}
                className="w-full sm:w-auto text-green-600 border-green-300 hover:bg-green-50"
              >
                Zapisz
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelEdit} className="w-full sm:w-auto">
                Anuluj
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isEditing ? (
          // Display mode
          <>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Przód fiszki:</h4>
              <p className="text-gray-900 bg-white p-3 rounded border">{proposal.front}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Tył fiszki:</h4>
              <p className="text-gray-900 bg-white p-3 rounded border">{proposal.back}</p>
            </div>
          </>
        ) : (
          // Edit mode
          <>
            <div>
              <label htmlFor="edit-front" className="block text-sm font-medium text-gray-700 mb-1">
                Przód fiszki:
              </label>
              <textarea
                id="edit-front"
                value={editForm.front}
                onChange={(e) => handleEditFormChange("front", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                maxLength={200}
                placeholder="Pytanie lub pojęcie..."
              />
              <div className="text-xs text-gray-500 mt-1">{editForm.front.length} / 200 znaków</div>
            </div>

            <div>
              <label htmlFor="edit-back" className="block text-sm font-medium text-gray-700 mb-1">
                Tył fiszki:
              </label>
              <textarea
                id="edit-back"
                value={editForm.back}
                onChange={(e) => handleEditFormChange("back", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                maxLength={500}
                placeholder="Odpowiedź lub wyjaśnienie..."
              />
              <div className="text-xs text-gray-500 mt-1">{editForm.back.length} / 500 znaków</div>
            </div>

            {/* Validation messages */}
            {editForm.front.trim().length === 0 && (
              <p className="text-xs text-red-600">Przód fiszki nie może być pusty</p>
            )}
            {editForm.back.trim().length === 0 && <p className="text-xs text-red-600">Tył fiszki nie może być pusty</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashcardProposalCard;
