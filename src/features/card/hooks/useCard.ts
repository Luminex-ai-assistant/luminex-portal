import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, entityConfig } from '@/lib/api/cache';
import type {
  Card,
  CardStatus,
  Priority,
  Subtask,
  Comment,
  Attachment,
  CardLabel,
} from '@/types/card';
import type { PublicUser } from '@/types/user';
import type { ActivityLogEntry } from '@/types/activity';

// Mock API functions - replace with actual API calls
const fetchCardDetail = async (cardId: string): Promise<CardDetailData> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // This would be replaced with actual API call
  throw new Error('Not implemented - replace with actual API call');
};

const updateCard = async (cardId: string, updates: Partial<Card>): Promise<Card> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  throw new Error('Not implemented - replace with actual API call');
};

const createSubtask = async (cardId: string, title: string): Promise<Subtask> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  throw new Error('Not implemented - replace with actual API call');
};

const updateSubtask = async (subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  throw new Error('Not implemented - replace with actual API call');
};

const deleteSubtask = async (subtaskId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  throw new Error('Not implemented - replace with actual API call');
};

const createComment = async (cardId: string, content: string): Promise<Comment> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  throw new Error('Not implemented - replace with actual API call');
};

const updateComment = async (commentId: string, content: string): Promise<Comment> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  throw new Error('Not implemented - replace with actual API call');
};

const deleteComment = async (commentId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  throw new Error('Not implemented - replace with actual API call');
};

const addAttachment = async (cardId: string, url: string, name: string): Promise<Attachment> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  throw new Error('Not implemented - replace with actual API call');
};

const deleteAttachment = async (attachmentId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  throw new Error('Not implemented - replace with actual API call');
};

const fetchActivityLog = async (cardId: string): Promise<ActivityLogEntry[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  throw new Error('Not implemented - replace with actual API call');
};

// Extended card data interface
export interface CardDetailData {
  card: Card;
  activity: ActivityLogEntry[];
}

// Hook return type
export interface UseCardReturn {
  // Data
  card: Card | undefined;
  activity: ActivityLogEntry[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Card mutations
  updateCard: (updates: Partial<Card>) => void;
  isUpdatingCard: boolean;
  
  // Title mutation
  updateTitle: (title: string) => void;
  isUpdatingTitle: boolean;
  
  // Description mutation
  updateDescription: (description: string) => void;
  isUpdatingDescription: boolean;
  
  // Assignee mutations
  addAssignee: (userId: string) => void;
  removeAssignee: (userId: string) => void;
  isUpdatingAssignees: boolean;
  
  // Due date mutation
  updateDueDate: (dueDate: string | null) => void;
  isUpdatingDueDate: boolean;
  
  // Priority mutation
  updatePriority: (priority: Priority) => void;
  isUpdatingPriority: boolean;
  
  // Status mutation
  updateStatus: (status: CardStatus) => void;
  isUpdatingStatus: boolean;
  
  // Labels mutations
  addLabel: (label: CardLabel) => void;
  removeLabel: (labelId: string) => void;
  isUpdatingLabels: boolean;
  
  // Estimate mutation
  updateEstimate: (estimate: number | null) => void;
  isUpdatingEstimate: boolean;
  
  // Subtask mutations
  createSubtask: (title: string) => void;
  toggleSubtask: (subtaskId: string, isCompleted: boolean) => void;
  deleteSubtask: (subtaskId: string) => void;
  isCreatingSubtask: boolean;
  isUpdatingSubtask: boolean;
  isDeletingSubtask: boolean;
  
  // Comment mutations
  createComment: (content: string) => void;
  updateComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  isCreatingComment: boolean;
  isUpdatingComment: boolean;
  isDeletingComment: boolean;
  
  // Attachment mutations
  addAttachment: (url: string, name: string) => void;
  removeAttachment: (attachmentId: string) => void;
  isAddingAttachment: boolean;
  isRemovingAttachment: boolean;
}

export function useCard(cardId: string | null): UseCardReturn {
  const queryClient = useQueryClient();
  
  // Query for card detail
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<CardDetailData>({
    queryKey: queryKeys.cards.detail(cardId || ''),
    queryFn: () => fetchCardDetail(cardId!),
    enabled: !!cardId,
    staleTime: entityConfig.cards.staleTime,
  });
  
  // Card update mutation
  const cardMutation = useMutation({
    mutationFn: (updates: Partial<Card>) => updateCard(cardId!, updates),
    onSuccess: (updatedCard) => {
      queryClient.setQueryData(queryKeys.cards.detail(cardId!), (old: CardDetailData | undefined) => {
        if (!old) return old;
        return { ...old, card: updatedCard };
      });
      // Invalidate board cards list
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
  
  // Subtask mutations
  const subtaskCreateMutation = useMutation({
    mutationFn: (title: string) => createSubtask(cardId!, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId!) });
    },
  });
  
  const subtaskUpdateMutation = useMutation({
    mutationFn: ({ subtaskId, updates }: { subtaskId: string; updates: Partial<Subtask> }) =>
      updateSubtask(subtaskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId!) });
    },
  });
  
  const subtaskDeleteMutation = useMutation({
    mutationFn: (subtaskId: string) => deleteSubtask(subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId!) });
    },
  });
  
  // Comment mutations
  const commentCreateMutation = useMutation({
    mutationFn: (content: string) => createComment(cardId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId!) });
    },
  });
  
  const commentUpdateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId!) });
    },
  });
  
  const commentDeleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId!) });
    },
  });
  
  // Attachment mutations
  const attachmentAddMutation = useMutation({
    mutationFn: ({ url, name }: { url: string; name: string }) => addAttachment(cardId!, url, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId!) });
    },
  });
  
  const attachmentRemoveMutation = useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(cardId!) });
    },
  });
  
  // Convenience methods
  const updateTitle = (title: string) => cardMutation.mutate({ title });
  const updateDescription = (description: string) => cardMutation.mutate({ description });
  const addAssignee = (userId: string) => {
    const currentAssigneeIds = data?.card.assigneeIds || [];
    if (!currentAssigneeIds.includes(userId)) {
      cardMutation.mutate({ assigneeIds: [...currentAssigneeIds, userId] });
    }
  };
  const removeAssignee = (userId: string) => {
    const currentAssigneeIds = data?.card.assigneeIds || [];
    cardMutation.mutate({ assigneeIds: currentAssigneeIds.filter((id) => id !== userId) });
  };
  const updateDueDate = (dueDate: string | null) => cardMutation.mutate({ dueDate });
  const updatePriority = (priority: Priority) => cardMutation.mutate({ priority });
  const updateStatus = (status: CardStatus) => cardMutation.mutate({ status });
  const addLabel = (label: CardLabel) => {
    const currentLabels = data?.card.labels || [];
    if (!currentLabels.find((l) => l.id === label.id)) {
      cardMutation.mutate({ labels: [...currentLabels, label] });
    }
  };
  const removeLabel = (labelId: string) => {
    const currentLabels = data?.card.labels || [];
    cardMutation.mutate({ labels: currentLabels.filter((l) => l.id !== labelId) });
  };
  const updateEstimate = (estimate: number | null) => cardMutation.mutate({ estimate });
  
  return {
    // Data
    card: data?.card,
    activity: data?.activity,
    isLoading,
    isError,
    error,
    
    // Card mutations
    updateCard: cardMutation.mutate,
    isUpdatingCard: cardMutation.isPending,
    
    // Title
    updateTitle,
    isUpdatingTitle: cardMutation.isPending,
    
    // Description
    updateDescription,
    isUpdatingDescription: cardMutation.isPending,
    
    // Assignees
    addAssignee,
    removeAssignee,
    isUpdatingAssignees: cardMutation.isPending,
    
    // Due date
    updateDueDate,
    isUpdatingDueDate: cardMutation.isPending,
    
    // Priority
    updatePriority,
    isUpdatingPriority: cardMutation.isPending,
    
    // Status
    updateStatus,
    isUpdatingStatus: cardMutation.isPending,
    
    // Labels
    addLabel,
    removeLabel,
    isUpdatingLabels: cardMutation.isPending,
    
    // Estimate
    updateEstimate,
    isUpdatingEstimate: cardMutation.isPending,
    
    // Subtasks
    createSubtask: subtaskCreateMutation.mutate,
    toggleSubtask: (subtaskId: string, isCompleted: boolean) =>
      subtaskUpdateMutation.mutate({ subtaskId, updates: { isCompleted } }),
    deleteSubtask: subtaskDeleteMutation.mutate,
    isCreatingSubtask: subtaskCreateMutation.isPending,
    isUpdatingSubtask: subtaskUpdateMutation.isPending,
    isDeletingSubtask: subtaskDeleteMutation.isPending,
    
    // Comments
    createComment: commentCreateMutation.mutate,
    updateComment: (commentId: string, content: string) =>
      commentUpdateMutation.mutate({ commentId, content }),
    deleteComment: commentDeleteMutation.mutate,
    isCreatingComment: commentCreateMutation.isPending,
    isUpdatingComment: commentUpdateMutation.isPending,
    isDeletingComment: commentDeleteMutation.isPending,
    
    // Attachments
    addAttachment: (url: string, name: string) => attachmentAddMutation.mutate({ url, name }),
    removeAttachment: attachmentRemoveMutation.mutate,
    isAddingAttachment: attachmentAddMutation.isPending,
    isRemovingAttachment: attachmentRemoveMutation.isPending,
  };
}
