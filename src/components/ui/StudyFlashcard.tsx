import { useState, useEffect } from 'react';
import type { FlashcardViewModel } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StudyFlashcardProps {
  flashcard: FlashcardViewModel;
}

export default function StudyFlashcard({ flashcard }: StudyFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when flashcard changes
  useEffect(() => {
    setIsFlipped(false);
  }, [flashcard.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        setIsFlipped(!isFlipped);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="min-h-[300px] md:min-h-[350px] cursor-pointer transition-all duration-500 hover:shadow-lg transform hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[300px] md:min-h-[350px]">
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="transition-all duration-300 ease-in-out">
              <p className="text-lg md:text-xl leading-relaxed break-words max-w-full">
                {isFlipped ? flashcard.back : flashcard.front}
              </p>
            </div>
          </div>
          
          <div className="space-y-3 w-full">
            <Button 
              onClick={handleFlip}
              variant="outline"
              className="min-w-[140px] transition-all duration-200 hover:scale-105"
              size="lg"
            >
              {isFlipped ? 'Pokaż przód' : 'Pokaż tył'}
            </Button>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {isFlipped ? 'Tył karty' : 'Przód karty'}
              </p>
              <p className="text-xs text-muted-foreground">
                Naciśnij <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Spacja</kbd> aby odwrócić
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}