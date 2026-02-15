import { Page } from '@/components/layout/Page';
import { Button } from '@/components/ui/Button';
import { Plus, FolderKanban, LayoutGrid, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from './components/StatsCard';
import { RecentActivity } from './components/RecentActivity';
import { QuickAccess } from './components/QuickAccess';
import { useDashboardData } from './hooks/useDashboardData';

export function DashboardPage() {
  const navigate = useNavigate();
  const { stats, activity, quickAccess, isLoading } = useDashboardData();

  return (
    <Page
      title="Dashboard"
      description="Overview of your workspaces and projects"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/workspaces/new')}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
          <Button size="sm" onClick={() => navigate('/projects/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active Projects"
            value={stats.data?.activeProjects ?? 0}
            change={
              stats.data?.changes.activeProjects
                ? {
                    value: stats.data.changes.activeProjects.value,
                    label: 'vs last week',
                    isPositive: stats.data.changes.activeProjects.isPositive,
                  }
                : undefined
            }
            icon={FolderKanban}
            color="indigo"
          />
          <StatsCard
            title="Tasks Due Today"
            value={stats.data?.tasksDueToday ?? 0}
            change={
              stats.data?.changes.tasksDueToday
                ? {
                    value: Math.abs(stats.data.changes.tasksDueToday.value),
                    label: 'vs yesterday',
                    isPositive: stats.data.changes.tasksDueToday.isPositive,
                  }
                : undefined
            }
            icon={LayoutGrid}
            color="amber"
          />
          <StatsCard
            title="Completed This Week"
            value={stats.data?.completedThisWeek ?? 0}
            change={
              stats.data?.changes.completedThisWeek
                ? {
                    value: stats.data.changes.completedThisWeek.value,
                    label: 'vs last week',
                    isPositive: stats.data.changes.completedThisWeek.isPositive,
                  }
                : undefined
            }
            icon={FolderKanban}
            color="emerald"
          />
          <StatsCard
            title="Notifications"
            value={stats.data?.notifications ?? 0}
            icon={Bell}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Access - Takes up 1 column */}
          <div className="lg:col-span-1">
            <QuickAccess
              items={quickAccess.data ?? []}
              isLoading={quickAccess.isLoading || isLoading}
            />
          </div>

          {/* Recent Activity - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <RecentActivity
              activities={activity.data ?? []}
              isLoading={activity.isLoading || isLoading}
            />
          </div>
        </div>
      </div>
    </Page>
  );
}

export default DashboardPage;
