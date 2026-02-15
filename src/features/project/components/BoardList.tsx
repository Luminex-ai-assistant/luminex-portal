import { useNavigate } from 'react-router-dom';
import { Plus, Layout, List, Calendar, Clock, Table2, MoreHorizontal, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import type { BoardSummary, BoardView } from '@/types/board';

interface BoardListProps {
  boards: BoardSummary[];
  isLoading?: boolean;
  onCreateBoard: () => void;
}

const viewIcons: Record<BoardView, typeof Layout> = {
  board: Layout,
  list: List,
  calendar: Calendar,
  timeline: Clock,
  table: Table2,
};

const viewLabels: Record<BoardView, string> = {
  board: 'Board',
  list: 'List',
  calendar: 'Calendar',
  timeline: 'Timeline',
  table: 'Table',
};

export function BoardList({ boards, isLoading, onCreateBoard }: BoardListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-slate-800/50" />
            <CardContent className="h-12" />
          </Card>
        ))}
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Layout className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">No boards yet</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Create your first board to start organizing tasks.
        </p>
        <Button onClick={onCreateBoard} className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Create Board
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <BoardCard 
          key={board.id} 
          board={board} 
          onClick={() => navigate(`board/${board.id}`)}
        />
      ))}
      
      {/* Create New Card */}
      <Card 
        className="border-dashed border-slate-700 bg-transparent hover:bg-slate-800/30 cursor-pointer transition-colors"
        onClick={onCreateBoard}
      >
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[140px] py-6">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center mb-3">
            <Plus className="h-5 w-5 text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-300">Create New Board</span>
        </CardContent>
      </Card>
    </div>
  );
}

interface BoardCardProps {
  board: BoardSummary;
  onClick: () => void;
}

function BoardCard({ board, onClick }: BoardCardProps) {
  const ViewIcon = viewIcons[board.defaultView];

  return (
    <Card className="group cursor-pointer hover:border-slate-700 transition-colors" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Layout className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate group-hover:text-indigo-400 transition-colors">
                {board.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <ViewIcon className="h-3.5 w-3.5" />
                {viewLabels[board.defaultView]} view
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-400" 
                onClick={(e) => { e.stopPropagation(); }}
              >
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="gap-1">
            <Layers className="h-3 w-3" />
            {board.cardCount} cards
          </Badge>
          {board.isArchived && (
            <Badge variant="outline">Archived</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
