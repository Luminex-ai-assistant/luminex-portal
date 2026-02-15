/**
 * Automation types for the portal
 * Defines automation rules and triggers
 */

import type { CardStatus, Priority } from './card';

/** Automation trigger types */
export enum AutomationTrigger {
  // Card triggers
  CARD_CREATED = 'card_created',
  CARD_MOVED = 'card_moved',
  CARD_STATUS_CHANGED = 'card_status_changed',
  CARD_PRIORITY_CHANGED = 'card_priority_changed',
  CARD_ASSIGNED = 'card_assigned',
  CARD_DUE_DATE_SET = 'card_due_date_set',
  CARD_DUE_DATE_APPROACHING = 'card_due_date_approaching',
  CARD_OVERDUE = 'card_overdue',
  CARD_LABEL_ADDED = 'card_label_added',
  
  // Comment triggers
  COMMENT_ADDED = 'comment_added',
  COMMENT_MENTION = 'comment_mention',
  
  // Checklist triggers
  CHECKLIST_COMPLETED = 'checklist_completed',
  ALL_CHECKLISTS_COMPLETED = 'all_checklists_completed',
  
  // Subtask triggers
  SUBTASK_COMPLETED = 'subtask_completed',
  ALL_SUBTASKS_COMPLETED = 'all_subtasks_completed',
  
  // Time-based triggers
  SCHEDULED = 'scheduled',
  RECURRING = 'recurring',
  
  // Custom trigger
  WEBHOOK = 'webhook',
  MANUAL = 'manual',
}

/** Automation action types */
export enum AutomationAction {
  // Card actions
  MOVE_CARD = 'move_card',
  UPDATE_CARD_STATUS = 'update_card_status',
  UPDATE_CARD_PRIORITY = 'update_card_priority',
  ASSIGN_CARD = 'assign_card',
  UNASSIGN_CARD = 'unassign_card',
  ADD_LABEL = 'add_label',
  REMOVE_LABEL = 'remove_label',
  SET_DUE_DATE = 'set_due_date',
  CLEAR_DUE_DATE = 'clear_due_date',
  ARCHIVE_CARD = 'archive_card',
  DELETE_CARD = 'delete_card',
  DUPLICATE_CARD = 'duplicate_card',
  CREATE_SUBTASK = 'create_subtask',
  
  // Notification actions
  SEND_NOTIFICATION = 'send_notification',
  SEND_EMAIL = 'send_email',
  SEND_WEBHOOK = 'send_webhook',
  
  // Integration actions
  POST_TO_SLACK = 'post_to_slack',
  POST_TO_DISCORD = 'post_to_discord',
  CREATE_GOOGLE_EVENT = 'create_google_event',
  CREATE_ZOOM_MEETING = 'create_zoom_meeting',
}

/** Automation condition operators */
export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
  IN = 'in',
  NOT_IN = 'not_in',
}

/** Automation condition */
export interface AutomationCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

/** Automation action configuration */
export interface AutomationActionConfig {
  id: string;
  type: AutomationAction;
  config: Record<string, unknown>;
  delayMinutes: number;
}

/** Automation trigger configuration */
export interface AutomationTriggerConfig {
  type: AutomationTrigger;
  config: Record<string, unknown>;
  conditions: AutomationCondition[];
  conditionLogic: 'all' | 'any'; // Whether all or any conditions must match
}

/** Automation entity */
export interface Automation {
  id: string;
  
  // Ownership
  workspaceId: string;
  projectId: string | null;
  boardId: string | null;
  createdBy: string;
  
  // Details
  name: string;
  description: string | null;
  
  // Configuration
  trigger: AutomationTriggerConfig;
  actions: AutomationActionConfig[];
  
  // Status
  isActive: boolean;
  isSystem: boolean; // System automations cannot be deleted
  
  // Execution stats
  runCount: number;
  successCount: number;
  failureCount: number;
  lastRunAt: string | null;
  lastError: string | null;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/** Automation run log entry */
export interface AutomationRun {
  id: string;
  automationId: string;
  
  // Trigger context
  triggerType: AutomationTrigger;
  entityType: string;
  entityId: string;
  
  // Execution details
  triggeredAt: string;
  startedAt: string;
  completedAt: string | null;
  
  // Results
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  error: string | null;
  actionsExecuted: number;
  actionsSucceeded: number;
  actionsFailed: number;
  
  // Detailed log
  actionLogs: AutomationActionLog[];
}

/** Individual action execution log */
export interface AutomationActionLog {
  actionId: string;
  actionType: AutomationAction;
  startedAt: string;
  completedAt: string | null;
  status: 'success' | 'failed' | 'skipped';
  error: string | null;
  result: unknown;
}

/** Automation template for quick creation */
export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  trigger: AutomationTriggerConfig;
  actions: AutomationActionConfig[];
}

/** Automation stats for dashboard */
export interface AutomationStats {
  totalAutomations: number;
  activeAutomations: number;
  totalRuns: number;
  successRate: number;
  topAutomations: Array<{
    automationId: string;
    name: string;
    runCount: number;
  }>;
}
