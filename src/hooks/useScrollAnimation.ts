import { useEffect } from 'react';

export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Add hide class first if not already present
          if (!entry.isIntersecting && !entry.target.classList.contains('hide')) {
            entry.target.classList.add('hide');
          }
          // Then handle the show/hide based on intersection
          if (entry.isIntersecting) {
            entry.target.classList.remove('hide');
            entry.target.classList.add('show');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    // Wait for a brief moment to ensure elements are in the DOM
    setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        // Add initial hide class
        el.classList.add('hide');
        observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, []);
}