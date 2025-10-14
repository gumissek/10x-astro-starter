import { Button } from '@/components/ui/button';

interface StudyControlsProps {
  onKnowClick: () => void;
  onDontKnowClick: () => void;
}

export default function StudyControls({ onKnowClick, onDontKnowClick }: StudyControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button 
        onClick={onDontKnowClick}
        variant="outline"
        size="lg"
        className="min-w-[140px] w-full sm:w-auto border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:scale-105"
      >
        <span className="mr-2">✗</span>
        Nie znam
      </Button>
      
      <Button 
        onClick={onKnowClick}
        variant="default"
        size="lg"
        className="min-w-[140px] w-full sm:w-auto bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
      >
        <span className="mr-2">✓</span>
        Znam
      </Button>
    </div>
  );
}