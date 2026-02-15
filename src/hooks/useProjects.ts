import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Project, ProjectWithMembers, ProjectMember } from '@/types/project';
import { ProjectStatus, ProjectMemberRole } from '@/types/project';
import { useWorkspaceStore } from '@/stores/workspaceStore';

// Mock data for development
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    workspaceId: 'ws-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design',
    status: ProjectStatus.ACTIVE,
    startDate: '2024-01-20T00:00:00Z',
    targetEndDate: '2024-03-15T00:00:00Z',
    actualEndDate: null,
    ownerId: 'user-1',
    settings: {
      defaultBoardId: 'board-1',
      allowExternalSharing: false,
      requireApprovalForChanges: false,
      sprintDuration: 14,
      workingDays: [1, 2, 3, 4, 5],
      customStatusColors: {},
      estimateUnit: 'points',
    },
    color: '#6366f1',
    icon: null,
    progress: 65,
    isArchived: false,
    boardCount: 3,
    memberCount: 5,
    cardCount: 42,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T14:30:00Z',
  },
  {
    id: 'proj-2',
    workspaceId: 'ws-1',
    name: 'Mobile App v2.0',
    description: 'Next version of our mobile application with new features',
    status: ProjectStatus.ACTIVE,
    startDate: '2024-02-01T00:00:00Z',
    targetEndDate: '2024-06-30T00:00:00Z',
    actualEndDate: null,
    ownerId: 'user-2',
    settings: {
      defaultBoardId: 'board-2',
      allowExternalSharing: false,
      requireApprovalForChanges: true,
      sprintDuration: 14,
      workingDays: [1, 2, 3, 4, 5],
      customStatusColors: {},
      estimateUnit: 'points',
    },
    color: '#ec4899',
    icon: null,
    progress: 30,
    isArchived: false,
    boardCount: 2,
    memberCount: 8,
    cardCount: 78,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-11-28T11:20:00Z',
  },
  {
    id: 'proj-3',
    workspaceId: 'ws-1',
    name: 'API Migration',
    description: 'Migrating legacy APIs to the new microservices architecture',
    status: ProjectStatus.PAUSED,
    startDate: '2024-03-01T00:00:00Z',
    targetEndDate: '2024-05-01T00:00:00Z',
    actualEndDate: null,
    ownerId: 'user-1',
    settings: {
      defaultBoardId: null,
      allowExternalSharing: false,
      requireApprovalForChanges: false,
      sprintDuration: 14,
      workingDays: [1, 2, 3, 4, 5],
      customStatusColors: {},
      estimateUnit: 'hours',
    },
    color: '#f59e0b',
    icon: null,
    progress: 45,
    isArchived: false,
    boardCount: 1,
    memberCount: 4,
    cardCount: 23,
    createdAt: '2024-02-15T14:00:00Z',
    updatedAt: '2024-10-20T16:45:00Z',
  },
  {
    id: 'proj-4',
    workspaceId: 'ws-2',
    name: 'Portfolio Site',
    description: 'Personal portfolio website to showcase my work',
    status: ProjectStatus.ACTIVE,
    startDate: '2024-03-10T00:00:00Z',
    targetEndDate: null,
    actualEndDate: null,
    ownerId: 'user-1',
    settings: {
      defaultBoardId: 'board-4',
      allowExternalSharing: true,
      requireApprovalForChanges: false,
      sprintDuration: 7,
      workingDays: [0, 1, 2, 3, 4, 5, 6],
      customStatusColors: {},
      estimateUnit: 'hours',
    },
    color: '#10b981',
    icon: null,
    progress: 80,
    isArchived: false,
    boardCount: 1,
    memberCount: 1,
    cardCount: 15,
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z',
  },
];

const MOCK_PROJECT_MEMBERS: ProjectMember[] = [
  {
    id: 'pm-1',
    projectId: 'proj-1',
    userId: 'user-1',
    user: { id: 'user-1', name: 'John Doe', avatarUrl: null },
    role: ProjectMemberRole.LEAD,
    joinedAt: '2024-01-15T10:00:00Z',
    invitedBy: null,
    isStarred: true,
    notificationLevel: 'all',
  },
  {
    id: 'pm-2',
    projectId: 'proj-1',
    userId: 'user-2',
    user: { id: 'user-2', name: 'Jane Smith', avatarUrl: null },
    role: ProjectMemberRole.MEMBER,
    joinedAt: '2024-01-20T09:00:00Z',
    invitedBy: 'user-1',
    isStarred: false,
    notificationLevel: 'mentions',
  },
  {
    id: 'pm-3',
    projectId: 'proj-2',
    userId: 'user-2',
    user: { id: 'user-2', name: 'Jane Smith', avatarUrl: null },
    role: ProjectMemberRole.LEAD,
    joinedAt: '2024-02-01T09:00:00Z',
    invitedBy: null,
    isStarred: true,
    notificationLevel: 'all',
  },
];

// API functions (mock)
const fetchProjects = async (workspaceId?: string): Promise<Project[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (workspaceId) {
    return MOCK_PROJECTS.filter((p) => p.workspaceId === workspaceId);
  }
  return [...MOCK_PROJECTS];
};

const fetchProjectById = async (id: string): Promise<ProjectWithMembers> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const project = MOCK_PROJECTS.find((p) => p.id === id);
  if (!project) throw new Error('Project not found');
  
  const members = MOCK_PROJECT_MEMBERS.filter((m) => m.projectId === id);
  return { ...project, members };
};

const createProjectApi = async (data: CreateProjectInput): Promise<Project> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    workspaceId: data.workspaceId,
    name: data.name,
    description: data.description || null,
    status: ProjectStatus.ACTIVE,
    startDate: null,
    targetEndDate: null,
    actualEndDate: null,
    ownerId: 'user-1',
    settings: {
      defaultBoardId: null,
      allowExternalSharing: false,
      requireApprovalForChanges: false,
      sprintDuration: 14,
      workingDays: [1, 2, 3, 4, 5],
      customStatusColors: {},
      estimateUnit: 'points',
    },
    color: data.color || '#6366f1',
    icon: null,
    progress: 0,
    isArchived: false,
    boardCount: 0,
    memberCount: 1,
    cardCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newProject;
};

const updateProjectApi = async (id: string, data: Partial<Project>): Promise<Project> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const project = MOCK_PROJECTS.find((p) => p.id === id);
  if (!project) throw new Error('Project not found');
  return { ...project, ...data, updatedAt: new Date().toISOString() };
};

const deleteProjectApi = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
};

// Types
interface CreateProjectInput {
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  visibility?: 'private' | 'internal' | 'public';
}

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (workspaceId?: string) => [...projectKeys.lists(), { workspaceId }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Hooks
export function useProjects(workspaceId?: string) {
  const { setRecentProjects } = useWorkspaceStore();
  
  return useQuery({
    queryKey: projectKeys.list(workspaceId),
    queryFn: () => fetchProjects(workspaceId),
    enabled: !workspaceId || !!workspaceId,
    staleTime: 5 * 60 * 1000,
    meta: {
      onSuccess: (data: Project[]) => {
        setRecentProjects(data.slice(0, 5));
      },
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => fetchProjectById(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProjectApi,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ 
        queryKey: projectKeys.list(newProject.workspaceId) 
      });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      updateProjectApi(id, data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ 
        queryKey: projectKeys.detail(updatedProject.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: projectKeys.list(updatedProject.workspaceId) 
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectApi,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// Import workspace keys for invalidation
import { workspaceKeys } from './useWorkspaces';
