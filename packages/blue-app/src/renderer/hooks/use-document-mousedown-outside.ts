import { useEffect } from 'react';

interface UseDocumentMouseDownOutsideOptions {
  enabled?: boolean;
  isInside: (target: EventTarget | null) => boolean;
  onMouseDownOutside: (event: MouseEvent) => void;
}

export function useDocumentMouseDownOutside({
  enabled = true,
  isInside,
  onMouseDownOutside,
}: UseDocumentMouseDownOutsideOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (isInside(event.target)) {
        return;
      }

      onMouseDownOutside(event);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [enabled, isInside, onMouseDownOutside]);
}