import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCard } from './hooks/useCard';
import { CardHeader } from './components/CardHeader';
import { CardDescription } from './components/CardDescription';
import { CardProperties } from './components/CardProperties';
import { CardSubtasks } from './components/CardSubtasks';
import { CardComments } from './components/CardComments';
import { CardActivity } from './components/CardActivity';
import { CardAttachments } from './components/CardAttachments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface CardDetailDrawerProps {
  projectName?: string;
  boardName?: string;
  currentUserId?: string;
}

export function CardDetailDrawer({
  projectName = 'Project',
  boardName = 'Board',
  currentUserId = '',
}: CardDetailDrawerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const cardId = searchParams.get('cardId');
  const [isOpen, setIsOpen] = React.useState(!!cardId);
  
  // Sync open state with URL
  React.useEffect(() => {
    setIsOpen(!!cardId);
  }, [cardId]);
  
  // Use card hook
  const {
    card,
    activity,
    isLoading,
    isError,
    error,
    updateTitle,
    updateDescription,
    addAssignee,
    removeAssignee,
    updateDueDate,
    updatePriority,
    updateStatus,
    addLabel,
    removeLabel,
    updateEstimate,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
    createComment,
    updateComment,
    deleteComment,
    addAttachment,
    removeAttachment,
    isUpdatingCard,
    isCreatingSubtask,
    isUpdatingSubtask,
    isDeletingSubtask,
    isCreatingComment,
    isUpdatingComment,
    isDeletingComment,
    isAddingAttachment,
    isRemovingAttachment,
  } = useCard(cardId);
  
  const handleClose = React.useCallback(() => {
    // Remove cardId from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('cardId');
    setSearchParams(newParams, { replace: true });
    setIsOpen(false);
  }, [searchParams, setSearchParams]);
  
  // Handle Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);
  
  // Handle assignee updates
  const handleUpdateAssignees = React.useCallback(
    (userIds: string[]) => {
      // Calculate added and removed assignees
      const currentIds = card?.assigneeIds || [];
      const added = userIds.filter((id) => !currentIds.includes(id));
      const removed = currentIds.filter((id) => !userIds.includes(id));
      
      added.forEach((id) => addAssignee(id));
      removed.forEach((id) => removeAssignee(id));
    },
    [card?.assigneeIds, addAssignee, removeAssignee]
  );
  
  // Handle label updates
  const handleUpdateLabels = React.useCallback(
    (labels: import('@/types/card').CardLabel[]) => {
      // Calculate added and removed labels
      const currentLabels = card?.labels || [];
      const added = labels.filter((l) => !currentLabels.some((cl) => cl.id === l.id));
      const removed = currentLabels.filter((cl) => !labels.some((l) => l.id === cl.id));
      
      added.forEach((label) => addLabel(label));
      removed.forEach((label) => removeLabel(label.id));
    },
    [card?.labels, addLabel, removeLabel]
  );
  
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        
        {/* Drawer Content */}
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-slate-950 shadow-2xl',
            'border-l border-slate-800',
            'flex flex-col',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
            'duration-300 ease-out'
          )}
        >
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Loading card...</span>
              </div>
            </div>
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-red-400 font-medium mb-2">Error loading card</p>
                <p className="text-slate-500 text-sm mb-4">
                  {error?.message || 'Something went wrong'}
                </p>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : !card ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-slate-400 font-medium mb-2">Card not found</p>
                <p className="text-slate-500 text-sm mb-4">
                  The card you&apos;re looking for doesn&apos;t exist or has been deleted.
                </p>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <CardHeader
                card={card}
                projectName={projectName}
                boardName={boardName}
                onClose={handleClose}
                onTitleUpdate={updateTitle}
                isUpdatingTitle={isUpdatingCard}
              />
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">
                  {/* Properties Grid */}
                  <CardProperties
                    card={card}
                    onUpdateAssignees={handleUpdateAssignees}
                    onUpdateDueDate={updateDueDate}
                    onUpdatePriority={updatePriority}
                    onUpdateStatus={updateStatus}
                    onUpdateLabels={handleUpdateLabels}
                    onUpdateEstimate={updateEstimate}
                    isUpdating={isUpdatingCard}
                  />
                  
                  {/* Description */}
                  <CardDescription
                    description={card.description}
                    onUpdate={updateDescription}
                    isUpdating={isUpdatingCard}
                  />
                  
                  {/* Subtasks */}
                  <CardSubtasks
                    subtasks={card.subtasks}
                    onCreate={createSubtask}
                    onToggle={toggleSubtask}
                    onDelete={deleteSubtask}
                    isCreating={isCreatingSubtask}
                    isUpdating={isUpdatingSubtask}
                    isDeleting={isDeletingSubtask}
                  />
                  
                  {/* Attachments */}
                  <CardAttachments
                    attachments={card.attachments}
                    onAdd={addAttachment}
                    onRemove={removeAttachment}
                    isAdding={isAddingAttachment}
                    isRemoving={isRemovingAttachment}
                  />
                  
                  {/* Tabs for Comments and Activity */}
                  <Tabs defaultValue="comments" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="comments">
                        Comments ({card.commentCount})
                      </TabsTrigger>
                      <TabsTrigger value="activity">
                        Activity ({activity?.length || 0})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="comments" className="mt-4">
                      <CardComments
                        comments={card.comments}
                        currentUserId={currentUserId}
                        onCreate={createComment}
                        onUpdate={updateComment}
                        onDelete={deleteComment}
                        isCreating={isCreatingComment}
                        isUpdating={isUpdatingComment}
                        isDeleting={isDeletingComment}
                      />
                    </TabsContent>
                    
                    <TabsContent value="activity" className="mt-4">
                      <CardActivity activity={activity || []} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
