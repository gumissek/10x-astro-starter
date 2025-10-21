import React from "react";
import { cn } from "../../lib/utils";

interface CharacterCounterProps {
  currentLength: number;
  maxLength: number;
  className?: string;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ currentLength, maxLength, className }) => {
  const isOverLimit = currentLength > maxLength;
  const isNearLimit = currentLength > maxLength * 0.8;

  return (
    <span
      className={cn(
        "text-sm",
        {
          "text-red-600": isOverLimit,
          "text-amber-600": !isOverLimit && isNearLimit,
          "text-gray-500": !isOverLimit && !isNearLimit,
        },
        className
      )}
    >
      {currentLength}/{maxLength}
    </span>
  );
};

export default CharacterCounter;
