import { useState } from 'react';
import { Save, Trash2, AlertTriangle, Archive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useUpdateProject } from '@/hooks/useProjects';
import type { Project, ProjectStatus } from '@/types/project';

interface ProjectSettingsProps {
  project: Project;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

export function ProjectSettings({ project }: ProjectSettingsProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState<ProjectStatus>(project.status);

  const updateProject = useUpdateProject();

  const handleSave = async () => {
    await updateProject.mutateAsync({
      id: project.id,
      data: {
        name: name.trim(),
        description: description.trim() || null,
        status,
      },
    });
  };

  const hasChanges = 
    name !== project.name ||
    description !== (project.description || '') ||
    status !== project.status;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage your project name, description, and status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this project..."
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    status === option.value
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
                disabled={updateProject.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {updateProject.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Project Statistics</CardTitle>
          <CardDescription>
            Overview of project activity and progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-white">{project.cardCount}</div>
              <div className="text-sm text-slate-400">Total Cards</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-white">{project.boardCount}</div>
              <div className="text-sm text-slate-400">Boards</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-white">{project.memberCount}</div>
              <div className="text-sm text-slate-400">Members</div>
            </div>
          </div>
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
              <h4 className="font-medium text-red-200">Archive Project</h4>
              <p className="text-sm text-red-400/70">
                Archive this project. It can be restored later.
              </p>
            </div>
            <Button variant="outline" className="gap-2 border-red-900/50 text-red-400 hover:bg-red-950/30">
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-red-950/20 border border-red-900/30">
            <div>
              <h4 className="font-medium text-red-200">Delete Project</h4>
              <p className="text-sm text-red-400/70">
                Permanently delete this project and all its boards.
              </p>
            </div>
            <Button variant="danger" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
