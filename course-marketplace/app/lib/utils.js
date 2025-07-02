import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useEffect, useState } from "react"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a more readable format
 * @param {string|Date} date - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Default formatting options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return dateObj.toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Global event manager to reduce duplicate event listeners
 * and improve performance by centralizing event handling
 */
export const globalEventManager = {
  _eventMap: new Map(),
  _listenerMap: new Map(),

  // Add an event listener with a unique ID
  addEventListener(eventType, id, callback) {
    if (!this._eventMap.has(eventType)) {
      this._eventMap.set(eventType, new Map());
      
      // Create the actual DOM listener that delegates to all registered callbacks
      const listener = (event) => {
        const callbacks = this._eventMap.get(eventType);
        if (callbacks) {
          callbacks.forEach(cb => cb(event));
        }
      };
      
      // Save the listener reference for removal later
      this._listenerMap.set(eventType, listener);
      
      // Add the single event listener to the document
      if (typeof document !== 'undefined') {
        document.addEventListener(eventType, listener);
      }
    }
    
    // Store this specific callback
    this._eventMap.get(eventType).set(id, callback);
    
    return () => this.removeEventListener(eventType, id);
  },
  
  // Remove an event listener by its ID
  removeEventListener(eventType, id) {
    const callbacks = this._eventMap.get(eventType);
    if (callbacks) {
      callbacks.delete(id);
      
      // If no more callbacks for this event, remove the listener
      if (callbacks.size === 0) {
        this._eventMap.delete(eventType);
        const listener = this._listenerMap.get(eventType);
        if (listener && typeof document !== 'undefined') {
          document.removeEventListener(eventType, listener);
          this._listenerMap.delete(eventType);
        }
      }
    }
  },
  
  // Clean up all event listeners
  cleanup() {
    if (typeof document !== 'undefined') {
      this._listenerMap.forEach((listener, eventType) => {
        document.removeEventListener(eventType, listener);
      });
    }
    this._eventMap.clear();
    this._listenerMap.clear();
  }
};

/**
 * Custom hook that tracks whether the current page/tab is visible to the user
 * @returns {boolean} Whether the page is currently visible
 */
export function usePageVisibility() {
  // Default to true if no visibility API
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined" 
      ? document.visibilityState === "visible" 
      : true
  );
  
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    
    // Initial check
    handleVisibilityChange();
    
    // Use global event manager instead of direct listener
    const cleanup = globalEventManager.addEventListener(
      "visibilitychange", 
      "usePageVisibility", 
      handleVisibilityChange
    );
    
    return cleanup;
  }, []);
  
  return isVisible;
}

/**
 * Helper function to throttle function calls
 * @param {Function} func - The function to throttle
 * @param {number} wait - The time in milliseconds to throttle
 * @returns {Function} The throttled function
 */
export function throttle(func, wait = 100) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * Hook that automatically pauses expensive operations when tab is not visible
 * @param {Function} callback - Function to execute only when tab is visible
 * @param {Array} dependencies - Dependency array for the effect
 */
export function useVisibleEffect(callback, dependencies = []) {
  const isVisible = usePageVisibility();
  
  useEffect(() => {
    let cleanup = null;
    
    if (isVisible) {
      cleanup = callback();
    }
    
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [isVisible, callback, ...dependencies]);
} 