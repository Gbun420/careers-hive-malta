"use client";

import { useEffect } from "react";

/**
 * Performance-optimized animator for Careers.mt.
 * Uses Intersection Observer to trigger entrance animations.
 */
export default function PerformanceAnimator() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "50px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          // Optionally stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements with the 'observe-on-scroll' class
    const elements = document.querySelectorAll(".observe-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null; // This component doesn't render anything
}
