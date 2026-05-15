import { useEffect, useCallback } from 'react';

export interface KeyboardShortcuts {
  onSave?: () => void;
  onHelp?: () => void;
  onNew?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if user is typing in an input or textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const isCtrl = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;

    // Ctrl+S: Save progress
    if (isCtrl && event.key === 's') {
      event.preventDefault();
      shortcuts.onSave?.();
      return;
    }

    // Ctrl+H: Show help
    if (isCtrl && event.key === 'h') {
      event.preventDefault();
      shortcuts.onHelp?.();
      return;
    }

    // Ctrl+N: New puzzle
    if (isCtrl && event.key === 'n') {
      event.preventDefault();
      shortcuts.onNew?.();
      return;
    }

    // Escape: Close modal/dialog
    if (event.key === 'Escape') {
      event.preventDefault();
      shortcuts.onEscape?.();
      return;
    }

    // Shift+?: Show shortcuts list
    if (isShift && event.key === '?') {
      event.preventDefault();
      shortcuts.onHelp?.();
      return;
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Helper to get keyboard shortcut display text
export function getShortcutDisplay(key: string, modifier?: 'ctrl' | 'shift' | 'alt'): string {
  const parts: string[] = [];
  if (modifier === 'ctrl' || modifier === 'shift' || modifier === 'alt') {
    parts.push(modifier.charAt(0).toUpperCase() + modifier.slice(1));
  }
  parts.push(key.toUpperCase());
  return parts.join('+');
}