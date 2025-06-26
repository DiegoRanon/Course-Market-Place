"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { signInWithPassword, signUpWithEmail, signOut as authSignOut } from "@/app/lib/api/auth";
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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const data = await getUserProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signUp = async (email, password, userData) => {
    const data = await signUpWithEmail(email, password, userData);
    console.log("User signed up successfully. Profile will be created after email confirmation.");
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
