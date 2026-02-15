/**
 * Notification types for the portal
 * Handles user notifications across the system
 */

import type { PublicUser } from '@/types/user';
import type { ActivityAction } from '@/types/activity';

/** Notification types */
export enum NotificationType {
  // Card notifications
  CARD_ASSIGNED = 'card_assigned',
  CARD_UNASSIGNED = 'card_unassigned',
  CARD_DUE_SOON = 'card_due_soon',
  CARD_OVERDUE = 'card_overdue',
  CARD_COMMENT = 'card_comment',
  CARD_MENTION = 'card_mention',
  CARD_STATUS_CHANGED = 'card_status_changed',
  CARD_MOVED = 'card_moved',
  
  // Project notifications
  PROJECT_INVITE = 'project_invite',
  PROJECT_ROLE_CHANGED = 'project_role_changed',
  PROJECT_ARCHIVED = 'project_archived',
  
  // Workspace notifications
  WORKSPACE_INVITE = 'workspace_invite',
  WORKSPACE_ROLE_CHANGED = 'workspace_role_changed',
  
  // Automation notifications
  AUTOMATION_TRIGGERED = 'automation_triggered',
  
  // System notifications
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  SYSTEM_MAINTENANCE = 'system_maintenance',
}

/** Notification priority */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/** Notification status */
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

/** Notification entity reference */
export interface NotificationEntity {
  type: string;
  id: string;
  name: string;
  url: string;
}

/** Notification interface */
export interface Notification {
  id: string;
  
  // Recipient
  userId: string;
  
  // Notification details
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  
  // Related entities
  actor: PublicUser | null;
  workspaceId: string | null;
  projectId: string | null;
  boardId: string | null;
  cardId: string | null;
  
  // Entity references for deep linking
  entities: {
    workspace?: NotificationEntity;
    project?: NotificationEntity;
    board?: NotificationEntity;
    card?: NotificationEntity;
    comment?: NotificationEntity;
  };
  
  // Action URL
  actionUrl: string;
  
  // Related activity (if triggered by activity)
  activityId: string | null;
  activityAction: ActivityAction | null;
  
  // Delivery status
  emailSent: boolean;
  emailSentAt: string | null;
  pushSent: boolean;
  pushSentAt: string | null;
  
  // Timestamps
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

/** Notification preferences per type */
export interface NotificationTypePreference {
  type: NotificationType;
  inApp: boolean;
  email: boolean;
  push: boolean;
}

/** Notification filter options */
export interface NotificationFilter {
  types?: NotificationType[];
  status?: NotificationStatus[];
  priority?: NotificationPriority[];
  workspaceId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Notification count summary */
export interface NotificationCounts {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

/** Notification batch action */
export interface NotificationBatchAction {
  notificationIds: string[];
  action: 'mark_read' | 'mark_unread' | 'archive' | 'delete';
}
