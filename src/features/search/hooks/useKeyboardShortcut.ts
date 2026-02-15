import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutOptions {
  /** Key combination to listen for (e.g., 'k' for Cmd+K) */
  key: string;
  /** Whether to require Cmd (Mac) or Ctrl (Windows/Linux) */
  metaKey?: boolean;
  /** Whether to require Ctrl key */
  ctrlKey?: boolean;
  /** Whether to require Shift key */
  shiftKey?: boolean;
  /** Whether to require Alt key */
  altKey?: boolean;
  /** Callback when shortcut is pressed */
  onShortcut: () => void;
  /** Whether the shortcut is enabled */
  enabled?: boolean;
}

/**
 * Custom hook for keyboard shortcuts
 * Usage: useKeyboardShortcut({ key: 'k', metaKey: true, onShortcut: () => {} })
 * This will trigger on Cmd+K (Mac) or Ctrl+K (Windows/Linux)
 */
export function useKeyboardShortcut({
  key,
  metaKey = false,
  ctrlKey = false,
  shiftKey = false,
  altKey = false,
  onShortcut,
  enabled = true,
}: UseKeyboardShortcutOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if any input element is focused (don't trigger shortcut while typing)
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // Allow shortcut in inputs only if it includes Escape or special combinations
      if (isInputFocused && key !== 'Escape') {
        // Still allow if meta/ctrl is pressed (common for shortcuts)
        if (!event.metaKey && !event.ctrlKey) {
          return;
        }
      }

      // Check if the key matches (case-insensitive)
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();

      // Check modifier keys
      const metaMatches = event.metaKey === metaKey;
      const ctrlMatches = event.ctrlKey === ctrlKey;
      const shiftMatches = event.shiftKey === shiftKey;
      const altMatches = event.altKey === altKey;

      // Handle Cmd/Ctrl+K pattern - either meta or ctrl should work
      const modifierMatches = metaKey || ctrlKey
        ? (event.metaKey || event.ctrlKey)
        : (metaMatches && ctrlMatches);

      if (
        keyMatches &&
        modifierMatches &&
        shiftMatches &&
        altMatches
      ) {
        event.preventDefault();
        event.stopPropagation();
        onShortcut();
      }
    },
    [key, metaKey, ctrlKey, shiftKey, altKey, onShortcut, enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Convenience hook for Cmd/Ctrl+K shortcut
 */
export function useCommandK(onShortcut: () => void, enabled = true): void {
  useKeyboardShortcut({
    key: 'k',
    metaKey: true,
    onShortcut,
    enabled,
  });
}
