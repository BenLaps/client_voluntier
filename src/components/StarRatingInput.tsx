// src/components/StarRatingInput.tsx
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from "@/lib/utils"; // Assumes you have shadcn's utility function

interface StarRatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({ rating, setRating, disabled = false }: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-6 w-6 cursor-pointer",
            (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
            disabled ? "cursor-not-allowed opacity-50" : ""
          )}
          onClick={() => !disabled && setRating(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
        />
      ))}
    </div>
  );
}