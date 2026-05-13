import { useCallback } from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  RefObject,
} from 'react';
import { isTextEditingTarget } from './use-keyboard-shortcuts';

interface UseKeyboardShortcutScopeOptions<T extends HTMLElement> {
  ref: RefObject<T | null>;
  enabled?: boolean;
  tabIndex?: number;
  disabledTabIndex?: number;
  onKeyDown?: (event: ReactKeyboardEvent<T>) => void;
  shouldIgnoreFocusTarget?: (target: EventTarget | null) => boolean;
}

interface KeyboardShortcutScopeProps<T extends HTMLElement> {
  tabIndex: number;
  onKeyDown: (event: ReactKeyboardEvent<T>) => void;
  onMouseDownCapture: (event: ReactMouseEvent<T>) => void;
  onContextMenuCapture: (event: ReactMouseEvent<T>) => void;
}

export function useKeyboardShortcutScope<T extends HTMLElement>({
  ref,
  enabled = true,
  tabIndex = 0,
  disabledTabIndex = -1,
  onKeyDown,
  shouldIgnoreFocusTarget = isTextEditingTarget,
}: UseKeyboardShortcutScopeOptions<T>): KeyboardShortcutScopeProps<T> {
  const focusSurface = useCallback((target: EventTarget | null) => {
    if (!enabled || shouldIgnoreFocusTarget(target)) {
      return;
    }

    ref.current?.focus();
  }, [enabled, ref, shouldIgnoreFocusTarget]);

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<T>) => {
    if (!enabled) {
      return;
    }

    onKeyDown?.(event);
  }, [enabled, onKeyDown]);

  const handleMouseDownCapture = useCallback((event: ReactMouseEvent<T>) => {
    focusSurface(event.target);
  }, [focusSurface]);

  const handleContextMenuCapture = useCallback((event: ReactMouseEvent<T>) => {
    focusSurface(event.target);
  }, [focusSurface]);

  return {
    tabIndex: enabled ? tabIndex : disabledTabIndex,
    onKeyDown: handleKeyDown,
    onMouseDownCapture: handleMouseDownCapture,
    onContextMenuCapture: handleContextMenuCapture,
  };
}