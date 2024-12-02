import { TaskComment } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface CommentCardProps {
  comment: TaskComment;
  onCommentDelete: (comment: TaskComment) => void;
}

const supabase = createClient();

const CommentCard = ({ comment, onCommentDelete }: CommentCardProps) => {
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-lg font-bold flex items-center space-x-2">
              <span>
                {comment.Author?.firstName ?? ''} {comment.Author?.middleName ?? ''} {comment.Author?.lastName ?? ''}
              </span>
              {userId === comment.Author?.id && (
                <Badge variant="outline">
                  <p className=''>You</p>
                </Badge>
              )}
            </p>
            <Badge variant="secondary" className="text-xs">
              {comment.Author?.userType ?? 'Unknown'}
            </Badge>
          </div>
        </div>
        {userId === comment.Author?.id && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCommentDelete(comment)}
            aria-label="Delete comment"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm">{comment.content}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {new Date(comment.timestamp || Date.now()).toLocaleString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}
      </CardFooter>
    </Card>
  );
};

export default CommentCard;
