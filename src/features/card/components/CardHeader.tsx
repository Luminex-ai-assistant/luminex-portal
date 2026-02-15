import * as React from 'react';
import { X, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Card } from '@/types/card';

interface CardHeaderProps {
  card: Card;
  projectName: string;
  boardName: string;
  onClose: () => void;
  onTitleUpdate: (title: string) => void;
  isUpdatingTitle: boolean;
}

export function CardHeader({
  card,
  projectName,
  boardName,
  onClose,
  onTitleUpdate,
  isUpdatingTitle,
}: CardHeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(card.title);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    setEditTitle(card.title);
  }, [card.title]);
  
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== card.title) {
      onTitleUpdate(trimmed);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditTitle(card.title);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    navigator.clipboard.writeText(url.toString());
  };
  
  return (
    <div className="flex items-start gap-4 p-6 border-b border-slate-800">
      <div className="flex-1 min-w-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <span className="hover:text-slate-300 cursor-pointer transition-colors">
            {projectName}
          </span>
          <span>/</span>
          <span className="hover:text-slate-300 cursor-pointer transition-colors">
            {boardName}
          </span>
        </nav>
        
        {/* Identifier */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
            {card.identifier}
          </span>
        </div>
        
        {/* Title - Editable */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              disabled={isUpdatingTitle}
              className="text-lg font-semibold bg-slate-800/50 border-slate-700"
            />
          </div>
        ) : (
          <h1
            onClick={() => setIsEditing(true)}
            className="text-xl font-semibold text-slate-100 cursor-text hover:bg-slate-800/50 rounded px-1 -mx-1 py-0.5 transition-colors"
            title="Click to edit"
          >
            {card.title}
          </h1>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyLink}
          title="Copy link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          title="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
