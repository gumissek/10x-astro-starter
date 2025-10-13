import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface FlashcardGeneratorFormProps {
  onGenerate: (text: string) => void;
  isLoading: boolean;
  initialText?: string;
  onTextChange?: (text: string) => void;
}

const FlashcardGeneratorForm: React.FC<FlashcardGeneratorFormProps> = ({
  onGenerate,
  isLoading,
  initialText = '',
  onTextChange,
}) => {
  const [text, setText] = useState<string>(initialText);

  // Character limits
  const MIN_CHARS = 1;
  const MAX_CHARS = 5000;

  // Validation
  const isTextValid = text.trim().length >= MIN_CHARS && text.length <= MAX_CHARS;
  const isSubmitDisabled = !isTextValid || isLoading;

  // Handle text change
  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    onTextChange?.(newText);
  }, [onTextChange]);

  // Handle form submission
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isTextValid || isLoading) {
      return;
    }

    onGenerate(text.trim());
  }, [text, isTextValid, isLoading, onGenerate]);

  // Get character count styling
  const getCharCountClassName = () => {
    if (text.length > MAX_CHARS) {
      return 'text-red-600';
    }
    if (text.length > MAX_CHARS * 0.9) {
      return 'text-amber-600';
    }
    return 'text-gray-500';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label 
          htmlFor="text-input" 
          className="block text-sm font-medium text-gray-700"
        >
          Tekst do analizy
        </label>
        <div className="relative">
          <textarea
            id="text-input"
            value={text}
            onChange={handleTextChange}
            placeholder="Wklej tutaj tekst z którego AI ma wygenerować fiszki do nauki..."
            className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={isLoading}
            maxLength={MAX_CHARS + 100} // Allow slight overflow for better UX
          />
        </div>
        
        {/* Character counter */}
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-600">
            Minimum {MIN_CHARS} znaków
          </div>
          <div className={getCharCountClassName()}>
            {text.length} / {MAX_CHARS}
          </div>
        </div>

        {/* Validation message */}
        {text.length > MAX_CHARS && (
          <p className="text-sm text-red-600">
            Tekst jest za długi. Maksymalna długość to {MAX_CHARS} znaków.
          </p>
        )}
        
        {text.trim().length > 0 && text.trim().length < MIN_CHARS && (
          <p className="text-sm text-red-600">
            Tekst jest za krótki. Minimalna długość to {MIN_CHARS} znak.
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="px-8 py-2 text-lg"
        >
          {isLoading ? 'Generuję...' : 'Generuj fiszki'}
        </Button>
      </div>

      {/* Tips for better results */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Wskazówki dla lepszych rezultatów:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Używaj tekstu edukacyjnego z jasno zdefiniowanymi pojęciami</li>
          <li>• Unikaj zbyt ogólnych lub zbyt technicznych fragmentów</li>
          <li>• Dłuższe teksty pozwalają na wygenerowanie więcej różnorodnych fiszek</li>
          <li>• Strukturyzowane treści (z nagłówkami, punktami) działają najlepiej</li>
        </ul>
      </div>
    </form>
  );
};

export default FlashcardGeneratorForm;