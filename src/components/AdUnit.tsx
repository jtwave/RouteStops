import React, { useEffect } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid';
  responsive?: boolean;
  className?: string;
}

export function AdUnit({ slot, format = 'auto', responsive = true, className = '' }: AdUnitProps) {
  useEffect(() => {
    try {
      // Push the command to Google AdSense
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.error('Error loading AdSense ad:', error);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="
pub-6294281117428580" // Replace with your publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}