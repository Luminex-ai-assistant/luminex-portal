/**
 * Card types for the portal
 * Cards are the main task entities
 */

import type { PublicUser, UserMention } from './user';

/** Card status enum */
export enum CardStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

/** Priority levels */
export enum Priority {
  LOWEST = 'lowest',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  HIGHEST = 'highest',
  URGENT = 'urgent',
}

/** Subtask within a card */
export interface Subtask {
  id: string;
  cardId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  assigneeId: string | null;
  assignee: PublicUser | null;
  createdAt: string;
  updatedAt: string;
}

/** Checklist item within a card */
export interface ChecklistItem {
  id: string;
  cardId: string;
  text: string;
  isChecked: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

/** Comment on a card */
export interface Comment {
  id: string;
  cardId: string;
  authorId: string;
  author: PublicUser;
  content: string;
  mentions: UserMention[];
  parentId: string | null; // For threaded replies
  replyCount: number;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Attachment to a card */
export interface Attachment {
  id: string;
  cardId: string;
  name: string;
  fileName: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  size: number; // bytes
  uploadedBy: string;
  uploadedByUser: PublicUser;
  isCover: boolean;
  createdAt: string;
}

/** Card label */
export interface CardLabel {
  id: string;
  name: string;
  color: string;
}

/** Time tracking entry */
export interface TimeEntry {
  id: string;
  cardId: string;
  userId: string;
  user: PublicUser;
  duration: number; // minutes
  description: string | null;
  startedAt: string;
  endedAt: string | null;
  isRunning: boolean;
}

/** Card dependency */
export interface CardDependency {
  id: string;
  cardId: string;
  dependsOnCardId: string;
  dependsOnCard: CardSummary;
  type: 'blocks' | 'blocked_by' | 'relates_to';
  createdAt: string;
}

/** Card summary for references */
export interface CardSummary {
  id: string;
  title: string;
  status: CardStatus;
  identifier: string; // e.g., "PROJ-123"
}

/** Custom field value on a card */
export interface CardCustomFieldValue {
  fieldId: string;
  value: unknown;
}

/** Card entity - main task unit */
export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  projectId: string;
  workspaceId: string;
  
  // Identifiers
  identifier: string; // e.g., "PROJ-123"
  title: string;
  description: string | null;
  
  // Status & Priority
  status: CardStatus;
  priority: Priority;
  position: number;
  
  // Assignees
  assigneeIds: string[];
  assignees: PublicUser[];
  
  // Dates
  dueDate: string | null;
  dueTime: string | null;
  startDate: string | null;
  completedAt: string | null;
  
  // Organization
  labels: CardLabel[];
  tags: string[];
  
  // Content
  subtasks: Subtask[];
  checklistItems: ChecklistItem[];
  attachments: Attachment[];
  comments: Comment[];
  customFields: CardCustomFieldValue[];
  
  // Estimates
  estimate: number | null;
  spentTime: number; // minutes
  
  // Relations
  parentId: string | null;
  dependencies: CardDependency[];
  
  // Metadata
  createdBy: string;
  createdByUser: PublicUser;
  createdAt: string;
  updatedAt: string;
  
  // Counters
  subtaskCount: number;
  completedSubtaskCount: number;
  commentCount: number;
  attachmentCount: number;
}

/** Card for board view (lightweight) */
export interface CardBoardView {
  id: string;
  identifier: string;
  title: string;
  status: CardStatus;
  priority: Priority;
  position: number;
  assignees: PublicUser[];
  dueDate: string | null;
  labels: CardLabel[];
  tags: string[];
  hasDescription: boolean;
  subtaskCount: number;
  completedSubtaskCount: number;
  commentCount: number;
  attachmentCount: number;
  coverImageUrl: string | null;
  estimate: number | null;
}

/** Pending move for optimistic updates */
export interface PendingMove {
  id: string;
  cardId: string;
  targetListId: string;
  targetIndex: number;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
}
