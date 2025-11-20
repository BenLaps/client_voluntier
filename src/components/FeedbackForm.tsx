// src/components/FeedbackForm.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCookie } from 'cookies-next';
import { StarRatingInput } from './StarRatingInput';
import { ActivityItem } from '@/constants/activities'; 
import { FeedbackEntry } from '@/constants/activities'; 

interface FeedbackFormProps {
  activityId: string;
  onFeedbackSubmitted: (newFeedback: FeedbackEntry[]) => void; // Use correct type
  activity: ActivityItem;
}

export function FeedbackForm({ activityId, onFeedbackSubmitted, activity }: FeedbackFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState(['']); // Start with one photo URL input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine user role and if they already submitted
  let userRole = 'user';
  if (user && activity.author && typeof activity.author === 'object' && activity.author.id === user.id) {
    userRole = 'author';
  } else if (user && activity.applications?.some(app => app.user.id === user.id && app.status === 'accepted')) {
    userRole = 'volunteer';
  }
  const [isSubmitted, setIsSubmitted] = useState(activity.feedback?.some(fb => fb.user === user?.id && fb.role === userRole));


  const handleAddPhotoField = () => {
    setPhotos([...photos, '']);
  };

  const handlePhotoChange = (index: number, value: string) => {
    const newPhotos = [...photos];
    newPhotos[index] = value;
    setPhotos(newPhotos);
  };

  const handleRemovePhotoField = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please provide a star rating.');
      return;
    }
    setError('');
    setIsLoading(true);
    const token = getCookie('token');

    const validPhotos = photos.filter(url => url.trim() !== ''); // Filter out empty strings

    try {
      const response = await fetch(`http://localhost:5000/api/activities/${activityId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, text, photos: validPhotos })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Failed to submit feedback');
      }

      const newFeedbackList = await response.json();
      onFeedbackSubmitted(newFeedbackList); // Update the parent component's state
      setIsSubmitted(true); // Set submission status to true
      // Reset form (optional)
      setRating(0);
      setText('');
      setPhotos(['']);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
      <h3 className="text-lg font-semibold">Leave Feedback</h3>
      <div>
        <Label>Your Rating*</Label>
        <StarRatingInput rating={rating} setRating={setRating} />
      </div>
      <div>
        <Label htmlFor="feedbackText">Your Report/Feedback (Optional)</Label>
        <Textarea
          id="feedbackText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience..."
          maxLength={2024}
        />
      </div>
       <div>
         <Label>Photo URLs (Optional)</Label>
         {photos.map((photoUrl, index) => (
           <div key={index} className="flex items-center gap-2 mt-1">
             <Input
               type="url"
               value={photoUrl}
               onChange={(e) => handlePhotoChange(index, e.target.value)}
               placeholder="https://example.com/photo.jpg"
             />
             {photos.length > 1 && (
               <Button type="button" variant="destructive" size="sm" onClick={() => handleRemovePhotoField(index)}>Remove</Button>
             )}
           </div>
         ))}
         <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddPhotoField}>Add Photo URL</Button>
       </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isLoading || rating === 0}>
        {isLoading ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
}