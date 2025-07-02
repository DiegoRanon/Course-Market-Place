"use client";

import { useEffect } from "react";

// Component to handle global page visibility optimization
export default function PageVisibilityManager() {
  useEffect(() => {
    // Set up throttled event handlers for resource-intensive operations
    let rafId;
    let lastResizeTime = 0;
    
    // Throttle resize events
    const handleResize = () => {
      if (Date.now() - lastResizeTime > 200) {
        lastResizeTime = Date.now();
        // Process resize event here
      }
    };
    
    // Handle tab visibility changes at document level
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      
      // Cancel any pending animation frames when hidden
      if (!isVisible && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      
      // When page becomes visible again, refresh any stale data if needed
      if (isVisible) {
        // Optional: trigger any necessary data refreshes here
      }
      
      // Set a data attribute on document body for CSS optimizations
      document.body.dataset.visible = isVisible ? "true" : "false";
    };
    
    // Add event listeners directly to window
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Initial check
    handleVisibilityChange();
    
    return () => {
      // Clean up handlers
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);
  
  return null;
} 