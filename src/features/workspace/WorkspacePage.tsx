import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Settings, FolderKanban, Loader2 } from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/hooks/useWorkspaces';
import { useProjects } from '@/hooks/useProjects';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { ProjectList } from './components/ProjectList';
import { CreateProjectModal } from './components/CreateProjectModal';
import { MembersList } from './components/MembersList';
import { WorkspaceSettings } from './components/WorkspaceSettings';

export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [activeTab, setActiveTab] = useState('projects');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: workspace, isLoading: isWorkspaceLoading } = useWorkspace(workspaceId || '');
  const { data: projects, isLoading: isProjectsLoading } = useProjects(workspaceId);

  if (isWorkspaceLoading || !workspace) {
    return (
      <Page>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </Page>
    );
  }

  return (
    <Page maxWidth="full">
      <div className="max-w-7xl mx-auto">
        <WorkspaceHeader 
          workspace={workspace} 
          onSettingsClick={() => setActiveTab('settings')}
        />

        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="projects" className="gap-2">
                <FolderKanban className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Projects</h2>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  New Project
                </Button>
              </div>
              <ProjectList 
                projects={projects || []} 
                isLoading={isProjectsLoading}
                onCreateProject={() => setIsCreateModalOpen(true)}
              />
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Members</h2>
                <Button variant="outline">Invite Member</Button>
              </div>
              <MembersList members={workspace.members || []} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <WorkspaceSettings workspace={workspace} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={workspace.id}
      />
    </Page>
  );
}
