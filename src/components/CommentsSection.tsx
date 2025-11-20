import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCookie } from 'cookies-next';
import moment from 'moment';

// --- Типізація ---
interface CommentAuthor {
  id: string;
  email: string;
}

interface Comment {
  id: string;
  text: string;
  author: CommentAuthor;
  createdAt: string;
  replies?: Comment[]; // Відповіді - це такий самий масив коментарів
}

interface CommentsSectionProps {
  activityId: string;
}

// --- Компонент форми для відповіді (ReplyForm) ---
// Ми виносимо його сюди, щоб він мав свій незалежний стан
interface ReplyFormProps {
  activityId: string;
  parentId: string;
  onReplySuccess: () => void; // Функція для перезавантаження коментарів
  onCancel: () => void;
}

function ReplyForm({ activityId, parentId, onReplySuccess, onCancel }: ReplyFormProps) {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    const token = getCookie('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/activities/${activityId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Ключова відмінність: відправляємо parentCommentId
        body: JSON.stringify({ text: replyText, parentCommentId: parentId })
      });
      if (!response.ok) throw new Error('Failed to post reply');
      
      onReplySuccess(); // Викликаємо перезавантаження коментарів у батьківському компоненті
      
    } catch (err) {
      console.error(err);
      // Тут можна показати помилку прямо у формі відповіді
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ml-6 mt-2 pl-4 border-l-2">
      <Textarea 
        placeholder="Write a reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        disabled={isSubmitting}
        className="mb-2"
      />
      <div className="flex gap-2">
        <Button onClick={handleSubmitReply} disabled={isSubmitting || !replyText.trim()} size="sm">
          {isSubmitting ? 'Posting...' : 'Post Reply'}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting} size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}


// --- Основний компонент CommentsSection ---
export function CommentsSection({ activityId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Завантаження всього списку
  const [isPosting, setIsPosting] = useState(false); // Надсилання головного коментаря
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // Який коментар ми редагуємо

  // Виносимо fetchComments, щоб ми могли викликати його повторно
  const fetchComments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/activities/${activityId}/comments`);
      if (!response.ok) {
        // Спробуємо прочитати помилку з тіла відповіді
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Завантажуємо коментарі при першому рендері
  useEffect(() => {
    if (activityId) {
      fetchComments();
    }
  }, [activityId]);

  // Хендлер ТІЛЬКИ для нових коментарів (верхнього рівня)
  const handleAddTopLevelComment = async () => {
    if (!newCommentText.trim() || !user) return;
    setIsPosting(true);
    setError('');
    const token = getCookie('token');

    try {
      const response = await fetch(`http://localhost:5000/api/activities/${activityId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newCommentText, parentCommentId: null }) // Явно вказуємо null
      });
      if (!response.ok) throw new Error('Failed to add comment');
      
      setNewCommentText(''); // Очищуємо головну форму
      fetchComments(); // Перезавантажуємо всі коментарі
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
    } finally {
      setIsPosting(false);
    }
  };

  // Рекурсивна функція для рендерингу коментаря та його відповідей
  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="mb-4">
      <div className="border-l-2 pl-4">
        <p className="text-sm font-semibold">{comment.author?.email || 'User'}</p>
        <p className="text-xs text-muted-foreground mb-1">{moment(comment.createdAt).fromNow()}</p>
        <p className="mb-1">{comment.text}</p>
        
        {/* Кнопка "Reply" */}
        {user && (
          <Button 
            variant="link" 
            size="sm" 
            className="px-0 h-auto py-0 text-xs"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} // Дозволяє закрити, якщо натиснути ще раз
          >
            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
          </Button>
        )}

        {/* Форма для відповіді */}
        {replyingTo === comment.id && (
          <ReplyForm 
            activityId={activityId}
            parentId={comment.id}
            onCancel={() => setReplyingTo(null)}
            onReplySuccess={() => {
              setReplyingTo(null); // Закриваємо форму
              fetchComments();    // Перезавантажуємо коментарі
            }}
          />
        )}
      </div>

      {/* Рендеримо відповіді */}
      {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 ml-6 pl-4 border-l-2">
            {comment.replies.map(reply => renderComment(reply))}
          </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Головна форма для нових коментарів */}
        {user && (
          <div className="mb-6">
            <Textarea
              placeholder="Write a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={isPosting}
              className="mb-2"
            />
            <Button onClick={handleAddTopLevelComment} disabled={isPosting || !newCommentText.trim()}>
              {isPosting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        )}
        {!user && <p className="text-muted-foreground mb-4">Login to post comments.</p>}

        {/* Стан завантаження/помилок/результатів */}
        {isLoading && comments.length === 0 && <p>Loading comments...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => renderComment(comment))}
          </div>
        ) : (
          !isLoading && <p className="text-muted-foreground">No comments yet.</p>
        )}
      </CardContent>
    </Card>
  );
}