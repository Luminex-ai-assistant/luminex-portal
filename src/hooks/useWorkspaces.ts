import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Workspace, WorkspaceWithMembers, WorkspaceMember } from '@/types/workspace';
import type { Project } from '@/types/project';
import { useWorkspaceStore } from '@/stores/workspaceStore';

// Mock data for development
const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Acme Corporation',
    description: 'Main workspace for Acme Corporation projects',
    slug: 'acme-corp',
    visibility: WorkspaceVisibility.INTERNAL,
    ownerId: 'user-1',
    settings: {
      allowPublicProjects: false,
      allowGuestAccess: false,
      defaultProjectTemplate: null,
      retentionDays: 365,
      customFields: [],
    },
    logoUrl: null,
    isArchived: false,
    memberCount: 12,
    projectCount: 5,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T14:30:00Z',
  },
  {
    id: 'ws-2',
    name: 'Personal Projects',
    description: 'My personal workspace for side projects',
    slug: 'personal',
    visibility: WorkspaceVisibility.PRIVATE,
    ownerId: 'user-1',
    settings: {
      allowPublicProjects: false,
      allowGuestAccess: false,
      defaultProjectTemplate: null,
      retentionDays: 365,
      customFields: [],
    },
    logoUrl: null,
    isArchived: false,
    memberCount: 1,
    projectCount: 3,
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-11-15T16:45:00Z',
  },
];

import { WorkspaceMemberRole, WorkspaceVisibility } from '@/types/workspace';

const MOCK_WORKSPACE_MEMBERS: WorkspaceMember[] = [
  {
    id: 'wm-1',
    workspaceId: 'ws-1',
    userId: 'user-1',
    user: { id: 'user-1', name: 'John Doe', avatarUrl: null },
    role: WorkspaceMemberRole.OWNER,
    joinedAt: '2024-01-15T10:00:00Z',
    invitedBy: null,
    permissions: ['*'],
  },
  {
    id: 'wm-2',
    workspaceId: 'ws-1',
    userId: 'user-2',
    user: { id: 'user-2', name: 'Jane Smith', avatarUrl: null },
    role: WorkspaceMemberRole.ADMIN,
    joinedAt: '2024-01-16T09:30:00Z',
    invitedBy: 'user-1',
    permissions: ['read', 'write', 'invite'],
  },
  {
    id: 'wm-3',
    workspaceId: 'ws-1',
    userId: 'user-3',
    user: { id: 'user-3', name: 'Bob Johnson', avatarUrl: null },
    role: WorkspaceMemberRole.MEMBER,
    joinedAt: '2024-02-01T11:00:00Z',
    invitedBy: 'user-2',
    permissions: ['read', 'write'],
  },
];

// API functions (mock)
const fetchWorkspaces = async (): Promise<Workspace[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...MOCK_WORKSPACES];
};

const fetchWorkspaceById = async (id: string): Promise<WorkspaceWithMembers> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const workspace = MOCK_WORKSPACES.find((w) => w.id === id);
  if (!workspace) throw new Error('Workspace not found');
  
  const members = MOCK_WORKSPACE_MEMBERS.filter((m) => m.workspaceId === id);
  return { ...workspace, members };
};

const createWorkspaceApi = async (data: CreateWorkspaceInput): Promise<Workspace> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const newWorkspace: Workspace = {
    id: `ws-${Date.now()}`,
    name: data.name,
    description: data.description,
    visibility: data.visibility,
    settings: data.settings || {
      allowPublicProjects: false,
      allowGuestAccess: false,
      defaultProjectTemplate: null,
      retentionDays: 365,
      customFields: [],
    },
    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    ownerId: 'user-1',
    logoUrl: null,
    isArchived: false,
    memberCount: 1,
    projectCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newWorkspace;
};

const updateWorkspaceApi = async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const workspace = MOCK_WORKSPACES.find((w) => w.id === id);
  if (!workspace) throw new Error('Workspace not found');
  return { ...workspace, ...data, updatedAt: new Date().toISOString() };
};

const deleteWorkspaceApi = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
};

// Types
interface CreateWorkspaceInput {
  name: string;
  description: string | null;
  visibility: WorkspaceVisibility;
  settings?: {
    allowPublicProjects: boolean;
    allowGuestAccess: boolean;
    defaultProjectTemplate: string | null;
    retentionDays: number;
    customFields: [];
  };
}

// Query keys
export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...workspaceKeys.lists(), { filters }] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
};

// Hooks
export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: fetchWorkspaces,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWorkspace(workspaceId: string) {
  const { setCurrentWorkspace } = useWorkspaceStore();
  
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: () => fetchWorkspaceById(workspaceId),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
    meta: {
      onSuccess: (data: WorkspaceWithMembers) => {
        setCurrentWorkspace(data);
      },
    },
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const { addWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: createWorkspaceApi,
    onSuccess: (newWorkspace) => {
      addWorkspace(newWorkspace);
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  const { updateWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workspace> }) =>
      updateWorkspaceApi(id, data),
    onSuccess: (updatedWorkspace, { id }) => {
      updateWorkspace(id, updatedWorkspace);
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const { removeWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: deleteWorkspaceApi,
    onSuccess: (_, id) => {
      removeWorkspace(id);
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}
