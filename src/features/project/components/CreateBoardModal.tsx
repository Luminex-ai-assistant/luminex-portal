import { useState } from 'react';
import { Layout, List, Calendar, Clock, Table2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { BoardView } from '@/types/board';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const TEMPLATES = [
  { id: 'blank', name: 'Blank Board', description: 'Start from scratch' },
  { id: 'kanban', name: 'Kanban', description: 'To Do, In Progress, Done' },
  { id: 'sprint', name: 'Sprint Planning', description: 'Backlog, Sprint, In Progress, Review' },
  { id: 'bug', name: 'Bug Tracking', description: 'New, Confirmed, In Progress, Testing, Fixed' },
];

const VIEW_OPTIONS: { value: BoardView; label: string; icon: typeof Layout }[] = [
  { value: 'board', label: 'Board', icon: Layout },
  { value: 'list', label: 'List', icon: List },
  { value: 'table', label: 'Table', icon: Table2 },
];

export function CreateBoardModal({ isOpen, onClose, projectId }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('blank');
  const [defaultView, setDefaultView] = useState<BoardView>('board');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Board name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsCreating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsCreating(false);

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setTemplate('blank');
    setDefaultView('board');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>
              Create a board to organize and track your tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Board Name */}
            <Input
              label="Board Name"
              placeholder="e.g., Sprint 24, Product Backlog"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
              autoFocus
            />

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="What is this board for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      template === t.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      template === t.id ? 'text-indigo-400' : 'text-slate-200'
                    }`}>
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Default View */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Default View
              </label>
              <div className="flex gap-2">
                {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDefaultView(value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      defaultView === value
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
