// Dashboard Feature Exports

// Main Page
export { DashboardPage } from './DashboardPage';

// Components
export { StatsCard } from './components/StatsCard';
export { RecentActivity } from './components/RecentActivity';
export { QuickAccess } from './components/QuickAccess';

// Hooks
export {
  useDashboardData,
  useDashboardStats,
  useRecentActivity,
  useQuickAccess,
} from './hooks/useDashboardData';

// Types
export type { Activity } from './components/RecentActivity';
export type { QuickAccessItem } from './components/QuickAccess';
