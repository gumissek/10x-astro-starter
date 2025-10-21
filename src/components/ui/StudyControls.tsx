import { Button } from "@/components/ui/button";

interface StudyControlsProps {
  onKnowClick: () => void;
  onDontKnowClick: () => void;
}

export default function StudyControls({ onKnowClick, onDontKnowClick }: StudyControlsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
      <Button
        onClick={onDontKnowClick}
        variant="outline"
        size="lg"
        className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:scale-105"
      >
        <span className="mr-2">✗</span>
        Nie znam
      </Button>

      <Button
        onClick={onKnowClick}
        variant="default"
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
      >
        <span className="mr-2">✓</span>
        Znam
      </Button>
    </div>
  );
}
