import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  FolderOpen,
  SquareCheck,
  Circle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult, CardSearchResult } from '../types';
import { SearchResultType, CardStatus } from '../types';

export interface SearchResultItemProps {
  /** Search result data */
  result: SearchResult;
  /** Whether this item is selected */
  isSelected?: boolean;
  /** Callback when item is clicked */
  onClick?: () => void;
  /** Search query for highlighting */
  query?: string;
}

/**
 * Get icon based on result type
 */
function getResultIcon(result: SearchResult) {
  switch (result.type) {
    case SearchResultType.WORKSPACE:
      return <Layout className="w-5 h-5" />;
    case SearchResultType.PROJECT:
      return <FolderOpen className="w-5 h-5" />;
    case SearchResultType.CARD:
      return getCardStatusIcon((result as CardSearchResult).status);
    default:
      return <Search className="w-5 h-5" />;
  }
}

/**
 * Get icon based on card status
 */
function getCardStatusIcon(status: CardStatus) {
  switch (status) {
    case CardStatus.DONE:
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case CardStatus.IN_PROGRESS:
      return <Clock className="w-5 h-5 text-amber-500" />;
    case CardStatus.CANCELLED:
      return <XCircle className="w-5 h-5 text-red-500" />;
    case CardStatus.REVIEW:
      return <SquareCheck className="w-5 h-5 text-purple-500" />;
    case CardStatus.BACKLOG:
      return <Circle className="w-5 h-5 text-slate-500" />;
    default:
      return <Circle className="w-5 h-5 text-blue-500" />;
  }
}

/**
 * Get icon color class based on result type
 */
function getIconColorClass(result: SearchResult): string {
  switch (result.type) {
    case SearchResultType.WORKSPACE:
      return 'text-indigo-400 bg-indigo-500/10';
    case SearchResultType.PROJECT:
      return 'text-emerald-400 bg-emerald-500/10';
    case SearchResultType.CARD:
      return 'text-slate-400 bg-slate-500/10';
    default:
      return 'text-slate-400 bg-slate-500/10';
  }
}

/**
 * Highlight matching text in a string
 */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark
          key={index}
          className="bg-indigo-500/30 text-indigo-200 rounded px-0.5 font-medium"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get breadcrumb path for a result
 */
function getBreadcrumb(result: SearchResult): string {
  switch (result.type) {
    case SearchResultType.WORKSPACE:
      return 'Workspace';
    case SearchResultType.PROJECT:
      return `${result.workspaceName}`;
    case SearchResultType.CARD:
      return `${result.workspaceName} > ${result.projectName}`;
    default:
      return '';
  }
}

/**
 * Get subtitle for a result
 */
function getSubtitle(result: SearchResult): string | null {
  switch (result.type) {
    case SearchResultType.WORKSPACE:
      return `${result.memberCount} members · ${result.projectCount} projects`;
    case SearchResultType.PROJECT:
      return `${result.cardCount} tasks`;
    case SearchResultType.CARD:
      return result.identifier;
    default:
      return null;
  }
}

/**
 * Get navigation path for a result
 */
function getNavigationPath(result: SearchResult): string {
  switch (result.type) {
    case SearchResultType.WORKSPACE:
      return `/workspaces/${result.id}`;
    case SearchResultType.PROJECT:
      return `/projects/${result.id}`;
    case SearchResultType.CARD:
      return `/cards/${result.id}`;
    default:
      return '/';
  }
}

export const SearchResultItem = React.forwardRef<HTMLButtonElement, SearchResultItemProps>(
  ({ result, isSelected = false, onClick, query = '' }, ref) => {
    const navigate = useNavigate();

    const handleClick = () => {
      onClick?.();
      navigate(getNavigationPath(result));
    };

    const icon = getResultIcon(result);
    const iconColorClass = getIconColorClass(result);
    const breadcrumb = getBreadcrumb(result);
    const subtitle = getSubtitle(result);

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          'w-full flex items-start gap-3 p-3 rounded-lg',
          'text-left transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950',
          isSelected
            ? 'bg-slate-800/80 border border-slate-700'
            : 'hover:bg-slate-800/50 border border-transparent'
        )}
        aria-selected={isSelected}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg',
            'flex items-center justify-center',
            iconColorClass
          )}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="text-sm font-medium text-slate-200 truncate">
            {highlightText(result.title, query)}
          </h4>

          {/* Subtitle / Identifier */}
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">
              {result.type === SearchResultType.CARD
                ? highlightText(subtitle, query)
                : subtitle}
            </p>
          )}

          {/* Breadcrumb */}
          <p className="text-xs text-slate-500 mt-1 truncate">
            {breadcrumb}
          </p>

          {/* Description preview for cards */}
          {result.type === SearchResultType.CARD && result.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {highlightText(result.description, query)}
            </p>
          )}
        </div>

        {/* Type indicator */}
        <div className="flex-shrink-0">
          <span
            className={cn(
              'text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full',
              result.type === SearchResultType.WORKSPACE && 'bg-indigo-500/10 text-indigo-400',
              result.type === SearchResultType.PROJECT && 'bg-emerald-500/10 text-emerald-400',
              result.type === SearchResultType.CARD && 'bg-slate-700 text-slate-400'
            )}
          >
            {result.type}
          </span>
        </div>
      </button>
    );
  }
);

SearchResultItem.displayName = 'SearchResultItem';
