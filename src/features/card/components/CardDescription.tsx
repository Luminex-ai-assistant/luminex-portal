import * as React from 'react';
import { Edit2, Check, X, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface CardDescriptionProps {
  description: string | null;
  onUpdate: (description: string) => void;
  isUpdating: boolean;
}

// Simple markdown parser for display
function parseMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/___(.*?)___/g, '<strong><em>$1</em></strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-300">$1</code>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 p-4 rounded-lg overflow-x-auto mt-3 mb-3"><code class="text-sm font-mono text-slate-300">$1</code></pre>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-400 hover:text-indigo-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^\s*[-*+] (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="mt-2 mb-2 space-y-1">$&</ul>')
    // Numbered lists
    .replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/(<li class="ml-4 list-decimal".*<\/li>\n?)+/g, '<ol class="mt-2 mb-2 space-y-1 list-decimal">$&</ol>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-3">$1</blockquote>')
    // Horizontal rule
    .replace(/^---+$/gim, '<hr class="my-4 border-slate-700">')
    // Paragraphs (wrap remaining text)
    .replace(/^(?!<[hluo]|\s*<li|<block|<hr)(.+)$/gim, '<p class="mb-2">$1</p>')
    // Line breaks
    .replace(/\n/g, '');
}

export function CardDescription({
  description,
  onUpdate,
  isUpdating,
}: CardDescriptionProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(description || '');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  React.useEffect(() => {
    setEditValue(description || '');
  }, [description]);
  
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    onUpdate(editValue.trim());
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditValue(description || '');
    setIsEditing(false);
  };
  
  const hasDescription = !!description?.trim();
  
  if (isEditing) {
    return (
      <div className="space-y-3">
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Add a description... (Markdown supported)"
          rows={6}
          autoResize
          className="min-h-[120px]"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUpdating}
          >
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-300">
          <AlignLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Description</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3.5 w-3.5 mr-1" />
          {hasDescription ? 'Edit' : 'Add'}
        </Button>
      </div>
      
      {hasDescription ? (
        <div
          className={cn(
            "prose prose-invert prose-slate max-w-none",
            "text-slate-300 text-sm leading-relaxed",
            "cursor-text hover:bg-slate-800/30 rounded-lg p-3 -mx-3 transition-colors"
          )}
          onClick={() => setIsEditing(true)}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(description!) }}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="text-slate-500 text-sm italic cursor-text hover:bg-slate-800/30 rounded-lg p-4 -mx-3 transition-colors border border-dashed border-slate-700 hover:border-slate-600"
        >
          Click to add a description...
          <span className="block text-xs text-slate-600 mt-1">
            Markdown supported: **bold**, *italic*, `code`, [links](url)
          </span>
        </div>
      )}
    </div>
  );
}
