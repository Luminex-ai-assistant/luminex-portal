import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FolderKanban, Users, Settings, Loader2 } from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useProject } from '@/hooks/useProjects';
import { ProjectHeader } from './components/ProjectHeader';
import { BoardList } from './components/BoardList';
import { CreateBoardModal } from './components/CreateBoardModal';
import { ProjectMembers } from './components/ProjectMembers';
import { ProjectSettings } from './components/ProjectSettings';
import type { BoardSummary } from '@/types/board';

// Mock boards data
const MOCK_BOARDS: BoardSummary[] = [
  { id: 'board-1', name: 'Product Backlog', defaultView: 'board', cardCount: 24, isArchived: false },
  { id: 'board-2', name: 'Sprint Planning', defaultView: 'board', cardCount: 12, isArchived: false },
  { id: 'board-3', name: 'Bug Tracking', defaultView: 'list', cardCount: 8, isArchived: false },
];

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState('boards');
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);

  const { data: project, isLoading } = useProject(projectId || '');

  if (isLoading || !project) {
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
        <ProjectHeader 
          project={project} 
          onSettingsClick={() => setActiveTab('settings')}
        />

        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="boards" className="gap-2">
                <FolderKanban className="h-4 w-4" />
                Boards
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

            <TabsContent value="boards" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Boards</h2>
                <button 
                  onClick={() => setIsCreateBoardOpen(true)}
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  + New Board
                </button>
              </div>
              <BoardList 
                boards={MOCK_BOARDS} 
                onCreateBoard={() => setIsCreateBoardOpen(true)}
              />
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Members</h2>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                  + Invite Member
                </button>
              </div>
              <ProjectMembers members={project.members || []} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <ProjectSettings project={project} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        projectId={project.id}
      />
    </Page>
  );
}
