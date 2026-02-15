import * as React from 'react';
import { Paperclip, Link2, ExternalLink, Trash2, Plus, Globe, FileText, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Attachment } from '@/types/card';

interface CardAttachmentsProps {
  attachments: Attachment[];
  onAdd: (url: string, name: string) => void;
  onRemove: (attachmentId: string) => void;
  isAdding: boolean;
  isRemoving: boolean;
}

function getAttachmentIcon(mimeType: string): React.ReactNode {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  }
  if (mimeType.includes('pdf')) {
    return <FileText className="h-4 w-4" />;
  }
  if (mimeType.startsWith('text/')) {
    return <FileText className="h-4 w-4" />;
  }
  return <Link2 className="h-4 w-4" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'External Link';
  }
}

export function CardAttachments({
  attachments,
  onAdd,
  onRemove,
  isAdding,
  isRemoving,
}: CardAttachmentsProps) {
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newUrl, setNewUrl] = React.useState('');
  const [newName, setNewName] = React.useState('');
  
  const handleSubmit = () => {
    const trimmedUrl = newUrl.trim();
    const trimmedName = newName.trim();
    
    if (trimmedUrl) {
      // Add https:// if no protocol
      let finalUrl = trimmedUrl;
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      
      const name = trimmedName || getDomainFromUrl(finalUrl);
      onAdd(finalUrl, name);
      setNewUrl('');
      setNewName('');
      setIsAddingNew(false);
    }
  };
  
  const handleCancel = () => {
    setNewUrl('');
    setNewName('');
    setIsAddingNew(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <Paperclip className="h-4 w-4" />
          <span className="text-sm font-medium">Attachments</span>
          <span className="text-xs text-slate-500">({attachments.length})</span>
        </div>
        {!isAddingNew && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingNew(true)}
            disabled={isAdding}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        )}
      </div>
      
      {/* Add New Attachment */}
      {isAddingNew && (
        <div className="space-y-2 p-3 bg-slate-800/50 rounded-lg">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com or domain.com"
            className="h-9"
            autoFocus
          />
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Display name (optional)"
            className="h-9"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newUrl.trim() || isAdding}
            >
              Add Link
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isAdding}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
            No attachments yet. Add a link to get started.
          </div>
        ) : (
          attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              onRemove={onRemove}
              isRemoving={isRemoving}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface AttachmentItemProps {
  attachment: Attachment;
  onRemove: (attachmentId: string) => void;
  isRemoving: boolean;
}

function AttachmentItem({
  attachment,
  onRemove,
  isRemoving,
}: AttachmentItemProps) {
  const [showDelete, setShowDelete] = React.useState(false);
  const isUrl = attachment.url.startsWith('http');
  
  const handleOpen = () => {
    if (isUrl) {
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border transition-colors",
        "border-slate-800 hover:border-slate-700 bg-slate-900/50"
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
        {isUrl ? (
          <Globe className="h-5 w-5" />
        ) : (
          getAttachmentIcon(attachment.mimeType)
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">
          {attachment.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{getDomainFromUrl(attachment.url)}</span>
          {attachment.size > 0 && (
            <>
              <span>•</span>
              <span>{formatFileSize(attachment.size)}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleOpen}
          title="Open link"
        >
          <ExternalLink className="h-4 w-4 text-slate-500 hover:text-slate-300" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            !showDelete && "opacity-0 group-hover:opacity-100"
          )}
          onClick={() => onRemove(attachment.id)}
          disabled={isRemoving}
          title="Remove attachment"
        >
          <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-400" />
        </Button>
      </div>
    </div>
  );
}
