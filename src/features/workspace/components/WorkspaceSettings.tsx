import { useState } from 'react';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useUpdateWorkspace, useDeleteWorkspace } from '@/hooks/useWorkspaces';
import { WorkspaceVisibility } from '@/types/workspace';
import type { Workspace } from '@/types/workspace';

interface WorkspaceSettingsProps {
  workspace: Workspace;
}

const visibilityOptions: { value: WorkspaceVisibility; label: string }[] = [
  { value: WorkspaceVisibility.PRIVATE, label: 'Private' },
  { value: WorkspaceVisibility.INTERNAL, label: 'Internal' },
  { value: WorkspaceVisibility.PUBLIC, label: 'Public' },
];

export function WorkspaceSettings({ workspace }: WorkspaceSettingsProps) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  const [visibility, setVisibility] = useState<WorkspaceVisibility>(workspace.visibility);

  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();

  const handleSave = async () => {
    await updateWorkspace.mutateAsync({
      id: workspace.id,
      data: {
        name: name.trim(),
        description: description.trim() || null,
        visibility,
      },
    });
  };

  const hasChanges = 
    name !== workspace.name ||
    description !== (workspace.description || '') ||
    visibility !== workspace.visibility;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage your workspace name, description, and visibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this workspace..."
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Visibility
            </label>
            <div className="flex flex-wrap gap-2">
              {visibilityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVisibility(option.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    visibility === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleSave} 
                disabled={updateWorkspace.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {updateWorkspace.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            These actions are irreversible. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-950/20 border border-red-900/30">
            <div>
              <h4 className="font-medium text-red-200">Delete Workspace</h4>
              <p className="text-sm text-red-400/70">
                Permanently delete this workspace and all its projects.
              </p>
            </div>
            <Button 
              variant="danger" 
              disabled={deleteWorkspace.isPending}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
