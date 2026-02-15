/**
 * Zod validation schemas for the portal
 * Runtime validation for all entities
 */

import { z } from 'zod';

// ISO 8601 datetime regex
const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?$/;

// ============================================================================
// User Schemas
// ============================================================================

export const userRoleSchema = z.enum(['super_admin', 'user']);

export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  inApp: z.boolean(),
  desktop: z.boolean(),
  mentionsOnly: z.boolean(),
  digestFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly', 'never']),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  notifications: notificationPreferencesSchema,
  sidebarCollapsed: z.boolean(),
  defaultBoardView: z.string(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().nullable(),
  role: userRoleSchema,
  preferences: userPreferencesSchema,
  isActive: z.boolean(),
  lastLoginAt: z.string().regex(isoDateTimeRegex).nullable(),
  createdAt: z.string().regex(isoDateTimeRegex),
  updatedAt: z.string().regex(isoDateTimeRegex),
});

export const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

// ============================================================================
// Workspace Schemas
// ============================================================================

export const workspaceVisibilitySchema = z.enum(['private', 'internal', 'public']);

export const workspaceMemberRoleSchema = z.enum(['owner', 'admin', 'member', 'guest']);

export const workspaceCustomFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['text', 'number', 'date', 'select', 'multi_select', 'boolean']),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
});

export const workspaceSettingsSchema = z.object({
  allowPublicProjects: z.boolean(),
  allowGuestAccess: z.boolean(),
  defaultProjectTemplate: z.string().nullable(),
  retentionDays: z.number().int().min(0),
  customFields: z.array(workspaceCustomFieldSchema),
});

export const workspaceMemberSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  userId: z.string(),
  user: publicUserSchema,
  role: workspaceMemberRoleSchema,
  joinedAt: z.string().regex(isoDateTimeRegex),
  invitedBy: z.string().nullable(),
  permissions: z.array(z.string()),
});

export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  visibility: workspaceVisibilitySchema,
  ownerId: z.string(),
  settings: workspaceSettingsSchema,
  logoUrl: z.string().nullable(),
  isArchived: z.boolean(),
  memberCount: z.number().int().min(0),
  projectCount: z.number().int().min(0),
  createdAt: z.string().regex(isoDateTimeRegex),
  updatedAt: z.string().regex(isoDateTimeRegex),
});

// ============================================================================
// Project Schemas
// ============================================================================

export const projectStatusSchema = z.enum(['active', 'archived', 'paused']);

export const projectMemberRoleSchema = z.enum(['lead', 'admin', 'member', 'viewer']);

export const projectSettingsSchema = z.object({
  defaultBoardId: z.string().nullable(),
  allowExternalSharing: z.boolean(),
  requireApprovalForChanges: z.boolean(),
  sprintDuration: z.number().int().min(1),
  workingDays: z.array(z.number().int().min(0).max(6)),
  customStatusColors: z.record(z.string(), z.string()),
  estimateUnit: z.enum(['points', 'hours', 'days']),
});

export const projectMemberSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  user: publicUserSchema,
  role: projectMemberRoleSchema,
  joinedAt: z.string().regex(isoDateTimeRegex),
  invitedBy: z.string().nullable(),
  isStarred: z.boolean(),
  notificationLevel: z.enum(['all', 'mentions', 'none']),
});

export const projectSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(2000).nullable(),
  status: projectStatusSchema,
  startDate: z.string().regex(isoDateTimeRegex).nullable(),
  targetEndDate: z.string().regex(isoDateTimeRegex).nullable(),
  actualEndDate: z.string().regex(isoDateTimeRegex).nullable(),
  ownerId: z.string(),
  settings: projectSettingsSchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().nullable(),
  progress: z.number().min(0).max(100),
  isArchived: z.boolean(),
  boardCount: z.number().int().min(0),
  memberCount: z.number().int().min(0),
  cardCount: z.number().int().min(0),
  createdAt: z.string().regex(isoDateTimeRegex),
  updatedAt: z.string().regex(isoDateTimeRegex),
});

// ============================================================================
// Board Schemas
// ============================================================================

export const boardViewSchema = z.enum(['board', 'list', 'calendar', 'timeline', 'table']);

export const boardFilterSchema = z.object({
  assignees: z.array(z.string()),
  labels: z.array(z.string()),
  dueDateRange: z.object({
    start: z.string().regex(isoDateTimeRegex).nullable(),
    end: z.string().regex(isoDateTimeRegex).nullable(),
  }).nullable(),
  priority: z.array(z.string()),
  status: z.array(z.string()),
  searchQuery: z.string(),
});

export const boardCustomFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['text', 'number', 'date', 'select', 'multi_select', 'checkbox', 'url']),
  options: z.array(z.string()).optional(),
  defaultValue: z.unknown().optional(),
});

export const boardSettingsSchema = z.object({
  defaultView: boardViewSchema,
  visibleViews: z.array(boardViewSchema),
  showCardCover: z.boolean(),
  showCardLabels: z.boolean(),
  showCardDueDate: z.boolean(),
  showCardAssignees: z.boolean(),
  autoArchiveDays: z.number().int().min(0).nullable(),
  customFields: z.array(boardCustomFieldSchema),
});

export const boardColumnSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  position: z.number().int().min(0),
  color: z.string().nullable(),
  limit: z.number().int().min(0).nullable(),
  isCollapsed: z.boolean(),
  cardCount: z.number().int().min(0),
  createdAt: z.string().regex(isoDateTimeRegex),
  updatedAt: z.string().regex(isoDateTimeRegex),
});

export const boardSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(2000).nullable(),
  settings: boardSettingsSchema,
  columns: z.array(boardColumnSchema),
  filter: boardFilterSchema,
  isArchived: z.boolean(),
  cardCount: z.number().int().min(0),
  position: z.number().int().min(0),
  createdBy: z.string(),
  createdAt: z.string().regex(isoDateTimeRegex),
  updatedAt: z.string().regex(isoDateTimeRegex),
});

// ============================================================================
// Card Schemas
// ============================================================================

export const cardStatusSchema = z.enum([
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done',
  'cancelled',
]);

export const prioritySchema = z.enum([
  'lowest',
  'low',
  'medium',
  'high',
  'highest',
  'urgent',
]);

export const cardLabelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const subtaskSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  title: z.string().min(1),
  isCompleted: z.boolean(),
  position: z.number().int().min(0),
  assigneeId: z.string().nullable(),
  assignee: publicUserSchema.nullable(),
  createdAt: z.string().regex(isoDateTimeRegex),
  updatedAt: z.string().regex(isoDateTimeRegex),
});

export const checklistItemSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  text: z.string().min(1),
  isChecked: z.boolean(),
  position: z.number().int().min(0),
  createdAt: z.string().regex(isoDateTimeRegex),
  updatedAt: z.string().regex(isoDateTimeRegex),
});

export const userMentionSchema = z.object({
  userId: z.string(),
  username: z.string(),
  startIndex: z.number().int().min(0),
  endIndex: z.number().int().min(0),
});

export const commentSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  authorId: z.string(),
  author: publicUserSchema,
  content: z.string().min(1).max(10000),
  mentions: z.array(userMentionSchema),
  parentId: z.string().nullable(),
  replyCount: z.number().int().min(0),
  isEdited: z.boolean(),
  editedAt: z.string().regex(isoDateTimeRegex).nullable(),
  createdAt: z.string().regex(isoDateTimeRegex),
  updatedAt: z.string().regex(isoDateTimeRegex),
});

export const attachmentSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  name: z.string(),
  fileName: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().nullable(),
  mimeType: z.string(),
  size: z.number().int().min(0),
  uploadedBy: z.string(),
  uploadedByUser: publicUserSchema,
  isCover: z.boolean(),
  createdAt: z.string().regex(isoDateTimeRegex),
});

export const cardCustomFieldValueSchema = z.object({
  fieldId: z.string(),
  value: z.unknown(),
});

export const cardSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  columnId: z.string(),
  projectId: z.string(),
  workspaceId: z.string(),
  identifier: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(50000).nullable(),
  status: cardStatusSchema,
  priority: prioritySchema,
  position: z.number().min(0),
  assigneeIds: z.array(z.string()),
  assignees: z.array(publicUserSchema),
  dueDate: z.string().regex(isoDateTimeRegex).nullable(),
  dueTime: z.string().nullable(),
  startDate: z.string().regex(isoDateTimeRegex).nullable(),
  completedAt: z.string().regex(isoDateTimeRegex).nullable(),
  labels: z.array(cardLabelSchema),
  tags: z.array(z.string()),
  subtasks: z.array(subtaskSchema),
  checklistItems: z.array(checklistItemSchema),
  attachments: z.array(attachmentSchema),
  comments: z.array(commentSchema),
  customFields: z.array(cardCustomFieldValueSchema),
  estimate: z.number().min(0).nullable(),
  spentTime: z.number().min(0),
  parentId: z.string().nullable(),
  dependencies: z.array(z.object({
    id: z.string(),
    cardId: z.string(),
    dependsOnCardId: z.string(),
    type: z.enum(['blocks', 'blocked_by', 'relates_to']),
    createdAt: z.string().regex(isoDateTimeRegex),
  })),
  createdBy: z.string(),
  createdByUser: publicUserSchema,
  createdAt: z.string().regex(isoDateTimeRegex),
  updatedAt: z.string().regex(isoDateTimeRegex),
  subtaskCount: z.number().int().min(0),
  completedSubtaskCount: z.number().int().min(0),
  commentCount: z.number().int().min(0),
  attachmentCount: z.number().int().min(0),
});

// ============================================================================
// Permission Schemas
// ============================================================================

export const permissionLevelSchema = z.enum(['none', 'view', 'comment', 'edit', 'admin', 'owner']);

export const workspacePermissionScopeSchema = z.enum([
  'workspace:view',
  'workspace:edit',
  'workspace:delete',
  'workspace:manage_members',
  'workspace:manage_settings',
  'project:create',
  'project:delete',
  'billing:view',
  'billing:manage',
]);

export const projectPermissionScopeSchema = z.enum([
  'project:view',
  'project:edit',
  'project:archive',
  'project:manage_members',
  'project:manage_settings',
  'board:create',
  'board:edit',
  'board:delete',
  'card:create',
  'card:edit',
  'card:delete',
  'card:move',
  'card:assign',
  'comment:create',
  'comment:edit_own',
  'comment:delete_own',
  'comment:delete_any',
  'attachment:create',
  'attachment:delete_own',
  'attachment:delete_any',
]);

// ============================================================================
// Activity Schemas
// ============================================================================

export const activityActionSchema = z.enum([
  'user:login',
  'user:logout',
  'user:registered',
  'user:updated',
  'workspace:created',
  'workspace:updated',
  'workspace:deleted',
  'workspace:member_added',
  'workspace:member_removed',
  'workspace:member_role_changed',
  'project:created',
  'project:updated',
  'project:archived',
  'project:unarchived',
  'project:deleted',
  'project:member_added',
  'project:member_removed',
  'project:member_role_changed',
  'board:created',
  'board:updated',
  'board:archived',
  'board:deleted',
  'board:reordered',
  'list:created',
  'list:updated',
  'list:deleted',
  'list:reordered',
  'card:created',
  'card:updated',
  'card:deleted',
  'card:moved',
  'card:duplicated',
  'card:archived',
  'card:restored',
  'card:assigned',
  'card:unassigned',
  'card:label_added',
  'card:label_removed',
  'card:due_date_changed',
  'card:priority_changed',
  'card:status_changed',
  'subtask:created',
  'subtask:updated',
  'subtask:deleted',
  'subtask:completed',
  'subtask:uncompleted',
  'checklist_item:created',
  'checklist_item:updated',
  'checklist_item:deleted',
  'checklist_item:checked',
  'checklist_item:unchecked',
  'comment:created',
  'comment:updated',
  'comment:deleted',
  'comment:replied',
  'attachment:uploaded',
  'attachment:deleted',
  'attachment:renamed',
  'automation:triggered',
  'automation:created',
  'automation:updated',
  'automation:deleted',
  'automation:enabled',
  'automation:disabled',
]);

export const entityTypeSchema = z.enum([
  'user',
  'workspace',
  'project',
  'board',
  'list',
  'card',
  'subtask',
  'checklist_item',
  'comment',
  'attachment',
  'automation',
  'label',
]);

// ============================================================================
// Notification Schemas
// ============================================================================

export const notificationTypeSchema = z.enum([
  'card_assigned',
  'card_unassigned',
  'card_due_soon',
  'card_overdue',
  'card_comment',
  'card_mention',
  'card_status_changed',
  'card_moved',
  'project_invite',
  'project_role_changed',
  'project_archived',
  'workspace_invite',
  'workspace_role_changed',
  'automation_triggered',
  'system_announcement',
  'system_maintenance',
]);

export const notificationPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

export const notificationStatusSchema = z.enum(['unread', 'read', 'archived']);

// ============================================================================
// Automation Schemas
// ============================================================================

export const automationTriggerSchema = z.enum([
  'card_created',
  'card_moved',
  'card_status_changed',
  'card_priority_changed',
  'card_assigned',
  'card_due_date_set',
  'card_due_date_approaching',
  'card_overdue',
  'card_label_added',
  'comment_added',
  'comment_mention',
  'checklist_completed',
  'all_checklists_completed',
  'subtask_completed',
  'all_subtasks_completed',
  'scheduled',
  'recurring',
  'webhook',
  'manual',
]);

export const automationActionSchema = z.enum([
  'move_card',
  'update_card_status',
  'update_card_priority',
  'assign_card',
  'unassign_card',
  'add_label',
  'remove_label',
  'set_due_date',
  'clear_due_date',
  'archive_card',
  'delete_card',
  'duplicate_card',
  'create_subtask',
  'send_notification',
  'send_email',
  'send_webhook',
  'post_to_slack',
  'post_to_discord',
  'create_google_event',
  'create_zoom_meeting',
]);

// ============================================================================
// Form Validation Schemas
// ============================================================================

/** Login form schema */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Create workspace form schema */
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  visibility: workspaceVisibilitySchema.default('private'),
  logoUrl: z.string().url().optional().nullable(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

/** Create project form schema */
export const createProjectSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace is required'),
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#6366F1'),
  icon: z.string().optional().nullable(),
  startDate: z.string().regex(isoDateTimeRegex).optional().nullable(),
  targetEndDate: z.string().regex(isoDateTimeRegex).optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/** Create board form schema */
export const createBoardSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Board name is required').max(100, 'Name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  defaultView: boardViewSchema.default('board'),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

/** Create card form schema */
export const createCardSchema = z.object({
  boardId: z.string().min(1, 'Board is required'),
  columnId: z.string().min(1, 'Column is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(50000, 'Description too long').optional(),
  priority: prioritySchema.default('medium'),
  assigneeIds: z.array(z.string()).default([]),
  dueDate: z.string().regex(isoDateTimeRegex).optional().nullable(),
  dueTime: z.string().optional().nullable(),
  startDate: z.string().regex(isoDateTimeRegex).optional().nullable(),
  labels: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
  })).default([]),
  tags: z.array(z.string()).default([]),
  estimate: z.number().min(0).optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

/** Update card form schema - all fields optional */
export const updateCardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(50000).optional().nullable(),
  status: cardStatusSchema.optional(),
  priority: prioritySchema.optional(),
  columnId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  dueDate: z.string().regex(isoDateTimeRegex).optional().nullable(),
  dueTime: z.string().optional().nullable(),
  startDate: z.string().regex(isoDateTimeRegex).optional().nullable(),
  labels: z.array(cardLabelSchema).optional(),
  tags: z.array(z.string()).optional(),
  estimate: z.number().min(0).optional().nullable(),
  parentId: z.string().optional().nullable(),
  isArchived: z.boolean().optional(),
}).partial();

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

// ============================================================================
// Additional Utility Schemas
// ============================================================================

/** Move card schema */
export const moveCardSchema = z.object({
  cardId: z.string(),
  targetColumnId: z.string(),
  targetPosition: z.number().min(0),
});

export type MoveCardInput = z.infer<typeof moveCardSchema>;

/** Create comment schema */
export const createCommentSchema = z.object({
  cardId: z.string(),
  content: z.string().min(1).max(10000),
  parentId: z.string().optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/** Create subtask schema */
export const createSubtaskSchema = z.object({
  cardId: z.string(),
  title: z.string().min(1).max(200),
  assigneeId: z.string().optional().nullable(),
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

/** Create checklist item schema */
export const createChecklistItemSchema = z.object({
  cardId: z.string(),
  text: z.string().min(1).max(500),
});

export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;

/** Invite member schema */
export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'guest']),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

/** Update user preferences schema */
export const updateUserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  sidebarCollapsed: z.boolean().optional(),
  defaultBoardView: z.string().optional(),
  notifications: notificationPreferencesSchema.optional(),
});

export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;
