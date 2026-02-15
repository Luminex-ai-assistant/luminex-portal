import * as React from 'react';
import { MessageSquare, Send, Edit2, Trash2, MoreHorizontal, AtSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { AvatarComponent } from '@/components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import type { Comment } from '@/types/card';
import type { PublicUser } from '@/types/user';

// Mock users for @mentions
const MOCK_USERS: PublicUser[] = [
  { id: '1', name: 'John Doe', avatarUrl: null },
  { id: '2', name: 'Jane Smith', avatarUrl: null },
  { id: '3', name: 'Bob Wilson', avatarUrl: null },
  { id: '4', name: 'Alice Brown', avatarUrl: null },
];

interface CardCommentsProps {
  comments: Comment[];
  currentUserId: string;
  onCreate: (content: string) => void;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function CardComments({
  comments,
  currentUserId,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
}: CardCommentsProps) {
  const [newComment, setNewComment] = React.useState('');
  const [showMentions, setShowMentions] = React.useState(false);
  const [mentionSearch, setMentionSearch] = React.useState('');
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Sort comments by date (newest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setNewComment(value);
    setCursorPosition(position);
    
    // Check if we should show mentions
    const textBeforeCursor = value.slice(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show mentions if there's no space after @
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };
  
  const handleMentionSelect = (user: PublicUser) => {
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const textAfterCursor = newComment.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newText =
      textBeforeCursor.slice(0, lastAtIndex) +
      `@${user.name.replace(/\s/g, '')} ` +
      textAfterCursor;
    
    setNewComment(newText);
    setShowMentions(false);
    textareaRef.current?.focus();
  };
  
  const handleSubmit = () => {
    const trimmed = newComment.trim();
    if (trimmed) {
      onCreate(trimmed);
      setNewComment('');
    }
  };
  
  const filteredUsers = MOCK_USERS.filter((user) =>
    user.name.toLowerCase().includes(mentionSearch)
  );
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-300">
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-medium">Comments</span>
        <span className="text-xs text-slate-500">({comments.length})</span>
      </div>
      
      {/* Add Comment */}
      <div className="relative space-y-2">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleInputChange}
            placeholder="Add a comment... Use @ to mention someone"
            rows={3}
            className="pr-10 resize-none"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-2 h-7 w-7"
            onClick={() => {
              const pos = textareaRef.current?.selectionStart || 0;
              setNewComment((prev) => prev.slice(0, pos) + '@' + prev.slice(pos));
              setCursorPosition(pos + 1);
              textareaRef.current?.focus();
            }}
            title="Mention someone"
          >
            <AtSign className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
        
        {/* Mentions Dropdown */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute z-10 w-56 bg-slate-900 border border-slate-700 rounded-md shadow-lg max-h-48 overflow-auto">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-left"
                onClick={() => handleMentionSelect(user)}
              >
                <AvatarComponent
                  src={user.avatarUrl || undefined}
                  alt={user.name}
                  fallback={getInitials(user.name)}
                  size="sm"
                />
                <span className="text-sm text-slate-300">{user.name}</span>
              </button>
            ))}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isCreating}
          >
            <Send className="h-4 w-4 mr-1.5" />
            Comment
          </Button>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-3">
        {sortedComments.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const isAuthor = comment.authorId === currentUserId;
  
  const handleSave = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== comment.content) {
      onUpdate(comment.id, trimmed);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Parse mentions in content
  const renderContent = (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a mention
        const user = MOCK_USERS.find(
          (u) => u.name.replace(/\s/g, '').toLowerCase() === part.toLowerCase()
        );
        if (user) {
          return (
            <span
              key={index}
              className="text-indigo-400 font-medium hover:underline cursor-pointer"
            >
              @{user.name}
            </span>
          );
        }
      }
      return part;
    });
  };
  
  return (
    <div className="flex gap-3 group">
      <AvatarComponent
        src={comment.author.avatarUrl || undefined}
        alt={comment.author.name}
        fallback={getInitials(comment.author.name)}
        size="sm"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-200">
            {comment.author.name}
          </span>
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {comment.isEdited && (
            <span className="text-xs text-slate-600">(edited)</span>
          )}
          
          {isAuthor && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(comment.id)}
                  disabled={isDeleting}
                  className="text-red-400 focus:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {renderContent(comment.content)}
          </p>
        )}
      </div>
    </div>
  );
}
