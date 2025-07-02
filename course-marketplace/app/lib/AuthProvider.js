"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import {
  signInWithPassword,
  signUpWithEmail,
  signOut as authSignOut,
} from "@/app/lib/api/auth";
import { getUserProfile, updateUserProfile } from "@/app/lib/api/profiles";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const authSubscriptionRef = useRef(null);
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (isMounted) {
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfile(session.user.id);
          }

          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const setupAuthListener = () => {
      // Clean up previous subscription if it exists
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
      }
      
      // Only set up listener if tab is visible
      if (isTabVisible) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (isMounted) {
            setUser(session?.user ?? null);

            if (session?.user) {
              await fetchProfile(session.user.id);
            } else {
              setProfile(null);
            }

            setLoading(false);
          }
        });
        
        authSubscriptionRef.current = subscription;
      }
    };

    setupAuthListener();

    // Page Visibility API handler
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setIsTabVisible(visible);
      
      // If becoming visible and we don't have an active subscription, set it up
      if (visible && !authSubscriptionRef.current) {
        setupAuthListener();
      } 
      // If becoming hidden, clean up subscription
      else if (!visible && authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      // Clean up auth subscription
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      if (!userId) {
        console.error("Cannot fetch profile: userId is undefined");
        setProfile(null);
        return;
      }

      const data = await getUserProfile(userId);

      if (!data) {
        console.warn("No profile data returned for user:", userId);
        // Set a minimal profile to prevent UI errors
        setProfile({
          id: userId,
          role: "student", // Default role
          status: "pending",
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Set a default profile to prevent UI errors
      setProfile({
        id: userId,
        role: "student", // Default role
        status: "error",
      });
    }
  };

  const signUp = async (email, password, userData) => {
    const data = await signUpWithEmail(email, password, userData);
    console.log(
      "User signed up successfully. Profile will be created after email confirmation."
    );
    return data;
  };

  const signIn = async (email, password) => {
    const data = await signInWithPassword(email, password);
    return data;
  };

  const signOut = async () => {
    await authSignOut();
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error("No user logged in");
    const data = await updateUserProfile(user.id, updates);
    setProfile(data);
    return data;
  };

  const isAdmin = () => {
    return profile?.role === "admin";
  };

  // Check if user is a Creator (can view course stats but not create courses)
  // Note: Admins also have Creator permissions
  const isCreator = () => {
    return profile?.role === "creator" || profile?.role === "admin";
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin,
    isCreator,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
