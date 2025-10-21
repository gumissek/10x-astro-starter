import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Folder, FlashcardProposalViewModel } from "@/types";
import FlashcardProposalCard from "./FlashcardProposalCard";
import FolderSelect from "./FolderSelect";

interface FlashcardProposalListProps {
  proposals: FlashcardProposalViewModel[];
  suggestedFolderName: string;
  folders: Folder[];
  onUpdateProposal: (updatedProposal: FlashcardProposalViewModel) => void;
  onSave: (folderId: string, folderName: string, acceptedFlashcards: FlashcardProposalViewModel[]) => void;
  onStartOver: () => void;
  isLoading: boolean;
}

const FlashcardProposalList: React.FC<FlashcardProposalListProps> = ({
  proposals,
  suggestedFolderName,
  folders,
  onUpdateProposal,
  onSave,
  onStartOver,
  isLoading,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [customFolderName, setCustomFolderName] = useState<string>(suggestedFolderName);

  // Calculate accepted proposals
  const acceptedProposals = useMemo(() => {
    return proposals.filter((proposal) => proposal.status === "accepted");
  }, [proposals]);

  // Calculate proposal counts
  const proposalCounts = useMemo(() => {
    return {
      total: proposals.length,
      accepted: acceptedProposals.length,
      rejected: proposals.filter((p) => p.status === "rejected").length,
      pending: proposals.filter((p) => p.status === "pending").length,
    };
  }, [proposals, acceptedProposals]);

  // Handle bulk actions
  const handleAcceptAll = () => {
    proposals.forEach((proposal) => {
      if (proposal.status === "pending") {
        onUpdateProposal({ ...proposal, status: "accepted" });
      }
    });
  };

  const handleAcceptAllIncludingRejected = () => {
    proposals.forEach((proposal) => {
      if (proposal.status !== "accepted") {
        onUpdateProposal({ ...proposal, status: "accepted" });
      }
    });
  };

  const handleRejectAll = () => {
    proposals.forEach((proposal) => {
      if (proposal.status === "pending") {
        onUpdateProposal({ ...proposal, status: "rejected" });
      }
    });
  };

  // Handle save
  const handleSave = () => {
    if (acceptedProposals.length === 0) return;

    const folderName = selectedFolderId ? "" : customFolderName.trim();
    const folderId = selectedFolderId || "new";

    onSave(folderId, folderName, acceptedProposals);
  };

  // Validation
  const isSaveDisabled =
    acceptedProposals.length === 0 || isLoading || (!selectedFolderId && customFolderName.trim().length === 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with stats and bulk actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-lg sm:text-xl">Wygenerowane propozycje fiszek</span>
            <Button variant="outline" size="sm" onClick={onStartOver} disabled={isLoading} className="w-full sm:w-auto">
              Zacznij od nowa
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full shrink-0"></div>
              <span className="whitespace-nowrap">Oczekujące: {proposalCounts.pending}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full shrink-0"></div>
              <span className="whitespace-nowrap">Zaakceptowane: {proposalCounts.accepted}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full shrink-0"></div>
              <span className="whitespace-nowrap">Odrzucone: {proposalCounts.rejected}</span>
            </div>
          </div>

          {/* Bulk actions */}
          {proposalCounts.pending > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptAll}
                disabled={isLoading}
                className="w-full sm:w-auto text-sm"
              >
                Zaakceptuj wszystkie oczekujące
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                disabled={isLoading}
                className="w-full sm:w-auto text-sm"
              >
                Odrzuć wszystkie oczekujące
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proposals list */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <FlashcardProposalCard
            key={proposal.id}
            proposal={proposal}
            onUpdate={onUpdateProposal}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Save section */}
      {acceptedProposals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Zapisz {acceptedProposals.length} zaakceptowanych fiszek
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Folder selection */}
            <FolderSelect
              folders={folders}
              selectedFolderId={selectedFolderId}
              customFolderName={customFolderName}
              suggestedFolderName={suggestedFolderName}
              onFolderSelect={setSelectedFolderId}
              onCustomFolderNameChange={setCustomFolderName}
              disabled={isLoading}
            />

            {/* Save button */}
            <div className="flex justify-center pt-4">
              <Button onClick={handleSave} disabled={isSaveDisabled} size="lg" className="w-full sm:w-auto sm:px-8">
                {isLoading ? "Zapisuję..." : `Zapisz ${acceptedProposals.length} fiszek`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state for no accepted proposals */}
      {acceptedProposals.length === 0 && proposalCounts.total > 0 && (
        <Card>
          <CardContent className="py-6 sm:py-8 text-center px-4">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Zaakceptuj przynajmniej jedną fiszkę, aby móc je zapisać.
            </p>
            <Button variant="outline" onClick={handleAcceptAllIncludingRejected} className="w-full sm:w-auto">
              Zaakceptuj wszystkie
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlashcardProposalList;
