// src/components/FeedbackDisplay.tsx
import { ActivityItem, FeedbackEntry } from '@/constants/activities'; // Ensure this type includes feedback
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRatingInput } from './StarRatingInput'; // Use for display too
import moment from 'moment';
import Image from 'next/image';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Optional: for user display

//  Define allowed roles explicitly for type safety
type FeedbackRole = 'author' | 'volunteer' | 'user';

// Helper to calculate weighted average
const calculateWeightedAverage = (feedback: FeedbackEntry[] | undefined): number => {
  if (!feedback || feedback.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  const weights = { author: 0.25, volunteer: 0.25, user: 0.50 };

  feedback.forEach((fb: FeedbackEntry) => {
    //  Ensure fb.role is treated as a valid key
    const role = fb.role as FeedbackRole; 
    const weight = weights[role] || 0; // Default to 0 if role is unexpected
    
    // Check if rating exists and is a number before calculation
    if (typeof fb.rating === 'number') {
        totalWeightedScore += fb.rating * weight;
        totalWeight += weight;
    }
  });

  return totalWeight === 0 ? 0 : (totalWeightedScore / totalWeight);
};

interface FeedbackDisplayProps {
  activity: ActivityItem;
}

export function FeedbackDisplay({ activity }: FeedbackDisplayProps) {
  const feedback = activity.feedback || [];
  const averageRating = calculateWeightedAverage(feedback);

  const renderFeedbackItem = (fb: FeedbackEntry) => {
    // Helper to safely get user details
    const getUserDetails = () => {
      if (typeof fb.user === 'object' && fb.user?.email) {
        return { email: fb.user.email, initial: fb.user.email[0].toUpperCase() };
      }
      return { email: 'Anonymous', initial: '?' };
    };

    const { email, initial } = getUserDetails();

    return (
      <div key={fb.id || fb.createdAt} className="border-b py-3 last:border-b-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{email}</span>
            <span className="text-xs text-muted-foreground">({fb.role})</span>
          </div>
          <span className="text-xs text-muted-foreground">{moment(fb.createdAt).fromNow()}</span>
        </div>
        <StarRatingInput rating={fb.rating} setRating={() => {}} disabled />
        {fb.text && <p className="mt-2 text-sm">{fb.text}</p>}
        {fb.photos && fb.photos.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {fb.photos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <Image src={url} alt={`Feedback photo ${i + 1}`} width={64} height={64} className="object-cover rounded border" />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback & Reports</CardTitle>
        {feedback.length > 0 && (
           <div className="flex items-center gap-2 pt-1">
              {/* Use Math.round for display */}
              <StarRatingInput rating={Math.round(averageRating)} setRating={() => {}} disabled /> 
              <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({feedback.length} ratings)</span>
           </div>
        )}
      </CardHeader>
      <CardContent>
        {feedback.length > 0 ? (
          feedback.map(renderFeedbackItem)
        ) : (
          <p className="text-muted-foreground">No feedback submitted yet.</p>
        )}
      </CardContent>
    </Card>
  );
}