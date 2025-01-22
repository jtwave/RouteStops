import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LoadingScreenProps {
  message: string;
  subMessage?: string;
}

export function LoadingScreen({ message, subMessage }: LoadingScreenProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-700 text-lg font-medium">{message}</p>
          {subMessage && (
            <p className="mt-2 text-gray-500 text-sm text-center">{subMessage}</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}