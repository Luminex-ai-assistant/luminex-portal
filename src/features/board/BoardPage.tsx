import { useParams } from 'react-router-dom';
import { Page } from '@/components/layout/Page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BoardPage() {
  const { workspaceId, projectId, boardId } = useParams<{ 
    workspaceId: string; 
    projectId: string; 
    boardId: string;
  }>();
  const navigate = useNavigate();

  return (
    <Page maxWidth="full">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/w/${workspaceId}/p/${projectId}`)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Project
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Layout className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Board View</CardTitle>
                <p className="text-sm text-slate-400">Board ID: {boardId}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-slate-400">
                Board view is under construction. 
                <br />
                <span className="text-sm text-slate-500">
                  This will contain the kanban board with cards and columns.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
