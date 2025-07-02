"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthProvider";
import Link from "next/link";
import { ChevronDown, ChevronUp, Play, Lock } from "lucide-react";

export default function Curriculum({ courseId }) {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCurriculum();
      checkEnrollment();
    }
  }, [courseId, user]);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);

      // Fetch sections for this course
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (sectionsError) throw sectionsError;

      // Initialize expanded state for all sections
      const expandedState = {};
      sectionsData.forEach((section) => {
        expandedState[section.id] = false;
      });
      setExpandedSections(expandedState);

      // For each section, fetch its lessons
      const sectionsWithLessons = await Promise.all(
        sectionsData.map(async (section) => {
          const { data: lessons, error: lessonsError } = await supabase
            .from("lessons")
            .select("*")
            .eq("section_id", section.id)
            .order("order_index", { ascending: true });

          if (lessonsError) throw lessonsError;

          return {
            ...section,
            lessons: lessons || [],
          };
        })
      );

      setSections(sectionsWithLessons);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching curriculum:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user) {
      setIsEnrolled(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) throw error;
      setIsEnrolled(!!data);
    } catch (err) {
      console.error("Error checking enrollment:", err);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "-- min";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-8 bg-gray-100 rounded w-full"></div>
              <div className="h-8 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <p>Error loading curriculum: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>

      {sections.length === 0 ? (
        <p className="text-gray-500 italic">
          No curriculum available for this course yet.
        </p>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <button
                className="w-full text-left bg-gray-50 p-4 flex justify-between items-center hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div>
                  <h3 className="text-lg font-medium">{section.title}</h3>
                  <p className="text-sm text-gray-600">
                    {section.lessons?.length || 0} lessons •{" "}
                    {formatDuration(
                      section.lessons?.reduce(
                        (total, lesson) => total + (lesson.duration || 0),
                        0
                      )
                    )}
                  </p>
                </div>
                <div>
                  {expandedSections[section.id] ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </button>

              {/* Section Lessons */}
              {expandedSections[section.id] && (
                <ul className="divide-y divide-gray-200">
                  {section.lessons.map((lesson) => {
                    const isLocked = !isEnrolled && !lesson.is_free;

                    return (
                      <li key={lesson.id} className="p-4 hover:bg-gray-50">
                        {isLocked ? (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Lock size={16} className="mr-3 text-gray-400" />
                              <div>
                                <h4 className="text-gray-600">
                                  {lesson.title}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {formatDuration(lesson.duration)}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-600 py-1 px-2 rounded-full">
                              Premium
                            </span>
                          </div>
                        ) : (
                          <Link
                            href={`/learn/${courseId}/${lesson.id}`}
                            className="flex justify-between items-center"
                          >
                            <div className="flex items-center">
                              <Play size={16} className="mr-3 text-blue-500" />
                              <div>
                                <h4 className="font-medium">{lesson.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {formatDuration(lesson.duration)}
                                </p>
                              </div>
                            </div>
                            {lesson.is_free && !isEnrolled && (
                              <span className="text-xs bg-green-100 text-green-600 py-1 px-2 rounded-full">
                                Free Preview
                              </span>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
