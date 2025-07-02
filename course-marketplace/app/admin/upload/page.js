"use client";

import { useAuth } from "@/app/lib/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CourseForm from "@/app/components/admin/CourseForm";

export default function UploadPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.push("/unauthorized");
    }
  }, [user, profile, loading, router]);

  // Set loading to false once auth is checked
  useEffect(() => {
    if (user !== undefined && profile !== undefined) {
      setLoading(false);
    }
  }, [user, profile]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Course</h1>
      <CourseForm />
    </div>
  );
}
