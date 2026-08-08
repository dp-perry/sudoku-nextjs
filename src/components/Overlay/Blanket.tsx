import React, { useEffect } from 'react';

interface BlanketProps {
  children: React.ReactNode;
  onClickOutside: () => void;
}

export default function Blanket({ children, onClickOutside }: BlanketProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClickOutside();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClickOutside]);

  // Closing on a press that lands on the backdrop itself covers mouse and touch in
  // one handler. A document-level listener could not tell the two apart, and the
  // previous version measured containment against a wrapper that filled the screen,
  // so it never fired at all.
  const handleBackdropPress = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClickOutside();
    }
  };

  return (
    <div className="bg-zinc-950/50 fixed w-full h-full top-0 left-0 z-[9999] backdrop-blur-sm p-4">
      <div
        onClick={handleBackdropPress}
        className='w-full h-full flex items-center justify-center'
      >
        {children}
      </div>
    </div>
  );
}
