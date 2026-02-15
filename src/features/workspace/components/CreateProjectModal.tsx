import { useState } from 'react';
import { X, Palette, Globe, Lock, Users } from 'lucide-react';
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
import { useCreateProject } from '@/hooks/useProjects';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

const PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16', // Lime
];

type VisibilityOption = 'private' | 'internal' | 'public';

const visibilityOptions: { value: VisibilityOption; label: string; description: string; icon: typeof Lock }[] = [
  { 
    value: 'private', 
    label: 'Private', 
    description: 'Only visible to workspace members',
    icon: Lock 
  },
  { 
    value: 'internal', 
    label: 'Internal', 
    description: 'Visible to all workspace members',
    icon: Users 
  },
  { 
    value: 'public', 
    label: 'Public', 
    description: 'Visible to anyone with the link',
    icon: Globe 
  },
];

export function CreateProjectModal({ isOpen, onClose, workspaceId }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [visibility, setVisibility] = useState<VisibilityOption>('private');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProject = useCreateProject();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await createProject.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      workspaceId,
      visibility,
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    setVisibility('private');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your boards and tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Project Name */}
            <Input
              label="Project Name"
              placeholder="e.g., Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
              autoFocus
            />

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Brief description of the project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-lg transition-all ${
                      color === c 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Palette className="h-4 w-4 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Visibility
              </label>
              <div className="grid gap-2">
                {visibilityOptions.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setVisibility(value)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      visibility === value
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      visibility === value ? 'bg-indigo-500/20' : 'bg-slate-800'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        visibility === value ? 'text-indigo-400' : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        visibility === value ? 'text-indigo-400' : 'text-slate-200'
                      }`}>
                        {label}
                      </div>
                      <div className="text-xs text-slate-400">{description}</div>
                    </div>
                    {visibility === value && (
                      <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
