import { useState, useEffect } from "react";
import type { StudySessionViewModel, FlashcardViewModel } from "@/types";
import StudyFlashcard from "@/components/ui/StudyFlashcard";
import StudyControls from "@/components/ui/StudyControls";
import StudyProgress from "@/components/ui/StudyProgress";
import LoadingSpinnerStudy from "@/components/ui/LoadingSpinnerStudy";
import { Button } from "@/components/ui/button";

interface StudySessionViewProps {
  folderId: string;
}

interface FlashcardsApiResponse {
  flashcards: FlashcardViewModel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function StudySessionView({ folderId }: StudySessionViewProps) {
  const [sessionState, setSessionState] = useState<StudySessionViewModel>({
    flashcards: [],
    currentCardIndex: 0,
    knownFlashcards: 0,
    status: "loading",
    error: null,
  });

  const fetchFlashcards = async () => {
    try {
      setSessionState((prev) => ({ ...prev, status: "loading", error: null }));

      const response = await fetch(`/api/flashcards?folderId=${folderId}&limit=100`);

      if (!response.ok) {
        throw new Error("Nie udało się pobrać fiszek");
      }

      const data = await response.json();
      const flashCards: FlashcardsApiResponse = data.data;
      if (flashCards.flashcards.length === 0) {
        throw new Error("Ten folder nie zawiera żadnych fiszek");
      }

      if (flashCards.flashcards.length < 10) {
        throw new Error("Ten folder zawiera za mało fiszek do sesji nauki (minimum 10)");
      }

      // Wybierz losowe 20 fiszek (lub wszystkie jeśli jest ich mniej niż 20)
      const shuffled = [...flashCards.flashcards].sort(() => 0.5 - Math.random());
      const studyFlashcards = shuffled.slice(0, Math.min(20, flashCards.flashcards.length));

      setSessionState((prev) => ({
        ...prev,
        flashcards: studyFlashcards,
        status: "studying",
        error: null,
      }));
    } catch (error) {
      setSessionState((prev) => ({
        ...prev,
        status: "loading",
        error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
      }));
    }
  };

  useEffect(() => {
    fetchFlashcards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  // Keyboard shortcuts for study controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (sessionState.status !== "studying") return;

      if (event.key === "ArrowLeft" || event.key === "1") {
        event.preventDefault();
        handleDontKnowClick();
      } else if (event.key === "ArrowRight" || event.key === "2") {
        event.preventDefault();
        handleKnowClick();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [sessionState.status]);

  const handleKnowClick = () => {
    setSessionState((prev) => {
      const newKnownCount = prev.knownFlashcards + 1;
      const newIndex = prev.currentCardIndex + 1;

      if (newIndex >= prev.flashcards.length) {
        return {
          ...prev,
          knownFlashcards: newKnownCount,
          status: "finished",
        };
      }

      return {
        ...prev,
        currentCardIndex: newIndex,
        knownFlashcards: newKnownCount,
      };
    });
  };

  const handleDontKnowClick = () => {
    setSessionState((prev) => {
      const newIndex = prev.currentCardIndex + 1;

      if (newIndex >= prev.flashcards.length) {
        return {
          ...prev,
          status: "finished",
        };
      }

      return {
        ...prev,
        currentCardIndex: newIndex,
      };
    });
  };

  const handleRetry = () => {
    fetchFlashcards();
  };

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const handleBackToFolder = () => {
    window.location.href = `/folders/${folderId}`;
  };

  const handleRestartSession = () => {
    setSessionState((prev) => ({
      ...prev,
      currentCardIndex: 0,
      knownFlashcards: 0,
      status: "studying",
    }));
  };

  if (sessionState.status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {sessionState.error ? (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-destructive">Błąd</h1>
              <p className="text-muted-foreground">{sessionState.error}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={handleRetry} variant="default" className="w-full">
                  Spróbuj ponownie
                </Button>
                <Button onClick={handleBackToDashboard} variant="outline" className="w-full">
                  Powrót do pulpitu
                </Button>
              </div>
            </div>
          ) : (
            <LoadingSpinnerStudy />
          )}
        </div>
      </div>
    );
  }

  if (sessionState.status === "finished") {
    const percentage = Math.round((sessionState.knownFlashcards / sessionState.flashcards.length) * 100);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Gratulacje!</h1>
          <div className="space-y-2">
            <p className="text-lg">
              Znasz <span className="font-semibold text-primary">{sessionState.knownFlashcards}</span> na{" "}
              <span className="font-semibold">{sessionState.flashcards.length}</span> fiszek
            </p>
            <p className="text-2xl font-bold text-primary">{percentage}%</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <Button onClick={handleRestartSession} variant="default" className="w-full">
              Rozpocznij ponownie
            </Button>
            <Button onClick={handleBackToFolder} variant="outline" className="w-full">
              Powrót do folderu
            </Button>
            <Button onClick={handleBackToDashboard} variant="ghost" className="w-full">
              Pulpit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentFlashcard = sessionState.flashcards[sessionState.currentCardIndex];

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            onClick={handleBackToFolder}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground self-start"
          >
            ← Powrót do folderu
          </Button>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <StudyProgress current={sessionState.currentCardIndex + 1} total={sessionState.flashcards.length} />
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <StudyFlashcard flashcard={currentFlashcard} />

          <div className="space-y-4">
            <StudyControls onKnowClick={handleKnowClick} onDontKnowClick={handleDontKnowClick} />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Użyj <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">←</kbd> lub{" "}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">1</kbd> dla &quot;Nie znam&quot; •
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mx-1">→</kbd> lub{" "}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">2</kbd> dla &quot;Znam&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
