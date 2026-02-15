/**
 * Notification types
 */

export enum NotificationType {
  CARD_MENTION = 'card_mention',
  CARD_ASSIGNED = 'card_assigned',
  CARD_COMMENT = 'card_comment',
  CARD_DUE_SOON = 'card_due_soon',
  CARD_OVERDUE = 'card_overdue',
  CARD_STATUS_CHANGED = 'card_status_changed',
  PROJECT_INVITE = 'project_invite',
  WORKSPACE_INVITE = 'workspace_invite',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export type NotificationStatus = 'unread' | 'read' | 'archived';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationActor {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface NotificationEntity {
  type: string;
  id: string;
  name: string;
  url: string;
}

export interface NotificationEntities {
  workspace?: NotificationEntity;
  project?: NotificationEntity;
  board?: NotificationEntity;
  card?: NotificationEntity;
  comment?: NotificationEntity;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  actor: NotificationActor | null;
  workspaceId: string | null;
  projectId: string | null;
  boardId: string | null;
  cardId: string | null;
  entities: NotificationEntities;
  actionUrl: string;
  activityId: string | null;
  activityAction: string | null;
  emailSent: boolean;
  emailSentAt: string | null;
  pushSent: boolean;
  pushSentAt: string | null;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}
