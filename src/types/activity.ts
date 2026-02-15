/**
 * Activity log types for the portal
 * Tracks all changes across the system
 */

import type { PublicUser } from './user';

/** Activity action types */
export enum ActivityAction {
  // User actions
  USER_LOGIN = 'user:login',
  USER_LOGOUT = 'user:logout',
  USER_REGISTERED = 'user:registered',
  USER_UPDATED = 'user:updated',
  
  // Workspace actions
  WORKSPACE_CREATED = 'workspace:created',
  WORKSPACE_UPDATED = 'workspace:updated',
  WORKSPACE_DELETED = 'workspace:deleted',
  WORKSPACE_MEMBER_ADDED = 'workspace:member_added',
  WORKSPACE_MEMBER_REMOVED = 'workspace:member_removed',
  WORKSPACE_MEMBER_ROLE_CHANGED = 'workspace:member_role_changed',
  
  // Project actions
  PROJECT_CREATED = 'project:created',
  PROJECT_UPDATED = 'project:updated',
  PROJECT_ARCHIVED = 'project:archived',
  PROJECT_UNARCHIVED = 'project:unarchived',
  PROJECT_DELETED = 'project:deleted',
  PROJECT_MEMBER_ADDED = 'project:member_added',
  PROJECT_MEMBER_REMOVED = 'project:member_removed',
  PROJECT_MEMBER_ROLE_CHANGED = 'project:member_role_changed',
  
  // Board actions
  BOARD_CREATED = 'board:created',
  BOARD_UPDATED = 'board:updated',
  BOARD_ARCHIVED = 'board:archived',
  BOARD_DELETED = 'board:deleted',
  BOARD_REORDERED = 'board:reordered',
  
  // List/Column actions
  LIST_CREATED = 'list:created',
  LIST_UPDATED = 'list:updated',
  LIST_DELETED = 'list:deleted',
  LIST_REORDERED = 'list:reordered',
  
  // Card actions
  CARD_CREATED = 'card:created',
  CARD_UPDATED = 'card:updated',
  CARD_DELETED = 'card:deleted',
  CARD_MOVED = 'card:moved',
  CARD_DUPLICATED = 'card:duplicated',
  CARD_ARCHIVED = 'card:archived',
  CARD_RESTORED = 'card:restored',
  
  // Card content actions
  CARD_ASSIGNED = 'card:assigned',
  CARD_UNASSIGNED = 'card:unassigned',
  CARD_LABEL_ADDED = 'card:label_added',
  CARD_LABEL_REMOVED = 'card:label_removed',
  CARD_DUE_DATE_CHANGED = 'card:due_date_changed',
  CARD_PRIORITY_CHANGED = 'card:priority_changed',
  CARD_STATUS_CHANGED = 'card:status_changed',
  
  // Subtask actions
  SUBTASK_CREATED = 'subtask:created',
  SUBTASK_UPDATED = 'subtask:updated',
  SUBTASK_DELETED = 'subtask:deleted',
  SUBTASK_COMPLETED = 'subtask:completed',
  SUBTASK_UNCOMPLETED = 'subtask:uncompleted',
  
  // Checklist actions
  CHECKLIST_ITEM_CREATED = 'checklist_item:created',
  CHECKLIST_ITEM_UPDATED = 'checklist_item:updated',
  CHECKLIST_ITEM_DELETED = 'checklist_item:deleted',
  CHECKLIST_ITEM_CHECKED = 'checklist_item:checked',
  CHECKLIST_ITEM_UNCHECKED = 'checklist_item:unchecked',
  
  // Comment actions
  COMMENT_CREATED = 'comment:created',
  COMMENT_UPDATED = 'comment:updated',
  COMMENT_DELETED = 'comment:deleted',
  COMMENT_REPLIED = 'comment:replied',
  
  // Attachment actions
  ATTACHMENT_UPLOADED = 'attachment:uploaded',
  ATTACHMENT_DELETED = 'attachment:deleted',
  ATTACHMENT_RENAMED = 'attachment:renamed',
  
  // Automation actions
  AUTOMATION_TRIGGERED = 'automation:triggered',
  AUTOMATION_CREATED = 'automation:created',
  AUTOMATION_UPDATED = 'automation:updated',
  AUTOMATION_DELETED = 'automation:deleted',
  AUTOMATION_ENABLED = 'automation:enabled',
  AUTOMATION_DISABLED = 'automation:disabled',
}

/** Entity types that can have activity logged */
export enum EntityType {
  USER = 'user',
  WORKSPACE = 'workspace',
  PROJECT = 'project',
  BOARD = 'board',
  LIST = 'list',
  CARD = 'card',
  SUBTASK = 'subtask',
  CHECKLIST_ITEM = 'checklist_item',
  COMMENT = 'comment',
  ATTACHMENT = 'attachment',
  AUTOMATION = 'automation',
  LABEL = 'label',
}

/** Activity log entry */
export interface ActivityLogEntry {
  id: string;
  
  // Action details
  action: ActivityAction;
  description: string;
  
  // Actor
  actorId: string;
  actor: PublicUser;
  
  // Target entity
  entityType: EntityType;
  entityId: string;
  entityName: string | null;
  
  // Parent context
  workspaceId: string | null;
  projectId: string | null;
  boardId: string | null;
  cardId: string | null;
  
  // Change details
  metadata: ActivityMetadata | null;
  changes: ActivityChange[];
  
  // Timestamps
  createdAt: string;
  
  // IP and user agent for audit
  ipAddress: string | null;
  userAgent: string | null;
}

/** Activity metadata for additional context */
export interface ActivityMetadata {
  [key: string]: unknown;
}

/** Individual field change */
export interface ActivityChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  displayName: string;
}

/** Activity log filter options */
export interface ActivityLogFilter {
  entityTypes?: EntityType[];
  actions?: ActivityAction[];
  actorIds?: string[];
  workspaceId?: string;
  projectId?: string;
  boardId?: string;
  cardId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Activity summary for dashboards */
export interface ActivitySummary {
  totalCount: number;
  byAction: Record<ActivityAction, number>;
  byUser: Record<string, number>;
  recentEntries: ActivityLogEntry[];
}
