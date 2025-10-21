import React, { useState, useEffect } from "react";
import type {
  Folder,
  GenerateFlashcardsResponseDTO,
  BulkSaveFlashcardsCommand,
  FlashcardProposalViewModel,
} from "@/types";
import FlashcardGeneratorForm from "./FlashcardGeneratorForm";
import FlashcardProposalList from "./FlashcardProposalList";
import LoadingSpinner from "./LoadingSpinner";

interface GenerateFlashcardsViewProps {
  userId: string;
}

const GenerateFlashcardsView: React.FC<GenerateFlashcardsViewProps> = ({ userId }) => {
  // State management
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestedFolderName, setSuggestedFolderName] = useState<string>("");
  const [proposals, setProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"form" | "loading" | "proposals">("form");

  const loadFolders = async () => {
    try {
      const response = await fetch(`/api/folders?user_id=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to load folders");
      }
      const foldersData = await response.json();
      // Check if the response has the expected structure
      if (foldersData.success && foldersData.data && foldersData.data.folders) {
        setFolders(foldersData.data.folders);
      } else {
        // Handle case where no folders exist (404) or other responses
        setFolders([]);
      }
    } catch (err) {
      // Don't show error for 404 (no folders found), just set empty array
      if (err instanceof Error && !err.message.includes("404")) {
        setError("Nie udało się załadować folderów. Spróbuj odświeżyć stronę.");
      }
      setFolders([]);
    }
  };
  // Load user folders on component mount
  useEffect(() => {
    loadFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate unique ID for proposals
  const generateId = (): string => {
    return `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle flashcard generation
  const handleGenerate = async (inputText: string) => {
    setIsLoading(true);
    setCurrentStep("loading");
    setError(null);

    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate flashcards");
      }

      const responseData = await response.json();

      // Check if the response has the expected structure
      if (!responseData.success || !responseData.data) {
        throw new Error(responseData.message || "Invalid response from server");
      }

      const data: GenerateFlashcardsResponseDTO = responseData.data;

      // Check if flashcards_proposals exists and is an array
      if (!data.flashcards_proposals || !Array.isArray(data.flashcards_proposals)) {
        throw new Error("No flashcards were generated from the provided text");
      }

      // Map API response to ViewModel
      const proposalViewModels: FlashcardProposalViewModel[] = data.flashcards_proposals.map((proposal) => ({
        id: generateId(),
        front: proposal.front,
        back: proposal.back,
        generation_source: proposal.generation_source,
        status: "pending" as const,
      }));

      setSuggestedFolderName(data.suggested_folder_name);
      setProposals(proposalViewModels);
      setCurrentStep("proposals");

      if (proposalViewModels.length === 0) {
        setError("Nie udało się wygenerować fiszek dla podanego tekstu. Spróbuj użyć innego fragmentu.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
      setCurrentStep("form");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle proposal updates
  const handleUpdateProposal = (updatedProposal: FlashcardProposalViewModel) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) => (proposal.id === updatedProposal.id ? updatedProposal : proposal))
    );
  };

  // Handle saving flashcards
  const handleSave = async (folderId: string, folderName: string, acceptedFlashcards: FlashcardProposalViewModel[]) => {
    setIsLoading(true);
    setError(null);

    try {
      let targetFolderId = folderId;

      // If creating a new folder, first create it
      if (folderId === "new") {
        const createFolderResponse = await fetch("/api/folders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: folderName,
            user_id: userId,
          }),
        });

        if (!createFolderResponse.ok) {
          const errorData = await createFolderResponse.json();
          throw new Error(errorData.message || "Failed to create folder");
        }

        const folderResult = await createFolderResponse.json();
        if (folderResult.success && folderResult.data && folderResult.data.folder) {
          targetFolderId = folderResult.data.folder.id;
        } else {
          throw new Error("Invalid response when creating folder");
        }
      }

      const saveCommand: BulkSaveFlashcardsCommand = {
        folder_id: targetFolderId,
        flashcards: acceptedFlashcards.map((card) => ({
          front: card.front,
          back: card.back,
          generation_source: card.generation_source,
        })),
      };

      const response = await fetch("/api/flashcards/bulk-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveCommand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save flashcards");
      }

      const result = await response.json();

      // Reload folders to show the newly created folder if applicable
      await loadFolders();

      // Reset form after successful save
      setText("");
      setProposals([]);
      setSuggestedFolderName("");
      setCurrentStep("form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania fiszek. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };
  // Handle starting over
  const handleStartOver = () => {
    setText("");
    setProposals([]);
    setSuggestedFolderName("");
    setError(null);
    setCurrentStep("form");
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-4">
          <p className="text-gray-600">Wklej tekst, a AI wygeneruje dla Ciebie propozycje fiszek do nauki.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {currentStep === "form" && (
        <FlashcardGeneratorForm
          onGenerate={handleGenerate}
          isLoading={isLoading}
          initialText={text}
          onTextChange={setText}
        />
      )}

      {currentStep === "loading" && <LoadingSpinner />}

      {currentStep === "proposals" && (
        <FlashcardProposalList
          proposals={proposals}
          suggestedFolderName={suggestedFolderName}
          folders={folders}
          onUpdateProposal={handleUpdateProposal}
          onSave={handleSave}
          onStartOver={handleStartOver}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default GenerateFlashcardsView;
