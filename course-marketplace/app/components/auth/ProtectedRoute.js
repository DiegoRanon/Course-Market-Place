"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login if not authenticated
        router.push(
          "/login?redirect=" + encodeURIComponent(window.location.pathname)
        );
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    };

    checkUser();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        setIsLoading(false);
      }
    });

    return () => {
      // Clean up the subscription when component unmounts
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If we get here, the user is authenticated
  return children;
}
