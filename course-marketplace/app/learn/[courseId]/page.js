"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthProvider";
import { supabase } from "@/app/lib/supabase";
import { getCourseById } from "@/app/lib/api/courses";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import VideoPlayer from "@/app/components/VideoPlayer";
import Button from "@/app/components/ui/Button";
import LoadingState from "@/app/components/ui/LoadingState";
import ErrorState from "@/app/components/ui/ErrorState";

export default function CourseViewer() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState({});
  const [courseProgress, setCourseProgress] = useState(0);

  useEffect(() => {
    if (params?.courseId && user) {
      fetchCourse();
      checkEnrollment();
    } else if (!user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/learn/${params?.courseId}`);
    }
  }, [params?.courseId, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const { data: courseData, error: courseError } = await getCourseById(
        params.courseId
      );
      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch sections for this course - removed sorting by 'order' column
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select("*")
        .eq("course_id", params.courseId);

      if (sectionsError) throw sectionsError;

      // For each section, fetch its lessons
      const sectionsWithLessons = await Promise.all(
        sectionsData.map(async (section) => {
          const { data: lessons, error: lessonsError } = await supabase
            .from("lessons")
            .select("*")
            .eq("section_id", section.id)
            .order("created_at", { ascending: true }); // Changed from 'order' to 'created_at'

          if (lessonsError) throw lessonsError;

          return {
            ...section,
            lessons: lessons || [],
          };
        })
      );

      setSections(sectionsWithLessons);

      // Find first lesson to display if no specific lesson is specified
      if (
        sectionsWithLessons.length > 0 &&
        sectionsWithLessons[0].lessons?.length > 0
      ) {
        const firstLesson = sectionsWithLessons[0].lessons[0];
        setCurrentLesson(firstLesson);
      }

      setLoading(false);

      // Fetch progress data for this course
      if (user) {
        fetchProgress();
      }
    } catch (err) {
      console.error("Error fetching course data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", params.courseId)
        .maybeSingle();

      if (error) throw error;

      // If enrollment exists, set state and continue
      if (data) {
        setIsEnrolled(true);
        return;
      }

      // If no enrollment exists, create one using upsert to handle potential duplicate errors
      console.log("No enrollment found, creating enrollment record...");
      const { error: upsertError } = await supabase.from("enrollments").upsert(
        {
          user_id: user.id,
          course_id: params.courseId,
          purchased_at: new Date().toISOString(),
          amount_paid: 0, // You can update this if you have course price info
        },
        {
          onConflict: "user_id,course_id",
          ignoreDuplicates: true,
        }
      );

      if (upsertError) {
        console.error("Error creating enrollment:", upsertError);
        throw upsertError;
      }

      console.log("Enrollment created successfully");
      setIsEnrolled(true);
    } catch (err) {
      console.error("Error checking/creating enrollment:", err);
      setError(err.message);
    }
  };

  const fetchProgress = async () => {
    try {
      // Get all lessons in this course
      const allLessons = sections.flatMap((section) => section.lessons || []);

      if (allLessons.length === 0) return;

      // Fetch progress for all lessons
      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .in(
          "lesson_id",
          allLessons.map((lesson) => lesson.id)
        );

      if (progressError) throw progressError;

      // Create a map of lesson_id to progress
      const progressMap = {};
      progressData?.forEach((item) => {
        progressMap[item.lesson_id] = item;
      });

      setProgress(progressMap);

      // Calculate overall course progress
      if (progressData && allLessons.length > 0) {
        const completedLessons = progressData.filter((p) => p.completed).length;
        setCourseProgress(
          Math.round((completedLessons / allLessons.length) * 100)
        );
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    // Update URL without full page refresh
    window.history.pushState({}, "", `/learn/${params.courseId}/${lesson.id}`);
  };

  const handleProgress = async (time, completed = false) => {
    if (!user || !currentLesson) return;

    try {
      // Check if a progress record already exists
      const { data: existing, error: existingError } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", currentLesson.id)
        .maybeSingle();

      if (existingError) throw existingError;

      let progressData = {
        user_id: user.id,
        lesson_id: currentLesson.id,
        course_id: params.courseId,
        watch_time: time,
        completed: completed || existing?.completed || false,
      };

      // If completed is true, mark as completed
      if (completed) {
        progressData.completed = true;
      }

      // If existing, update it, otherwise insert new record
      const { error: upsertError } = await supabase
        .from("progress")
        .upsert(progressData);

      if (upsertError) throw upsertError;

      // Update local progress state
      setProgress((prev) => ({
        ...prev,
        [currentLesson.id]: {
          ...prev[currentLesson.id],
          ...progressData,
        },
      }));

      // Update course progress
      fetchProgress();
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  const getNextLesson = () => {
    const allLessons = sections.flatMap((section) => section.lessons || []);
    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.id === currentLesson?.id
    );

    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }

    return null;
  };

  const getPreviousLesson = () => {
    const allLessons = sections.flatMap((section) => section.lessons || []);
    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.id === currentLesson?.id
    );

    if (currentIndex > 0) {
      return allLessons[currentIndex - 1];
    }

    return null;
  };

  const handleLessonComplete = async () => {
    if (!user || !currentLesson) return;

    // Get existing progress
    const existingProgress = progress[currentLesson.id];

    // Update with completed = true
    await handleProgress(existingProgress?.watch_time || 0, true);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "-- min";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="Loading course content..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <ErrorState
            title="Error Loading Course"
            message="There was an error loading the course content."
            details={error}
            onRetry={fetchCourse}
          />
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p className="mb-6">
              You need to enroll in this course to access the content.
            </p>
            <Button href={`/courses/${params.courseId}`} variant="primary">
              Go to Course Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {currentLesson ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <VideoPlayer
                videoUrl={currentLesson.video_url}
                courseId={params.courseId}
                lessonId={currentLesson.id}
                userId={user?.id}
                onProgress={handleProgress}
              />

              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">
                    {currentLesson.title}
                  </h2>
                  <button
                    className={`flex items-center ${
                      progress[currentLesson.id]?.completed
                        ? "text-green-600"
                        : "text-gray-400 hover:text-green-600"
                    }`}
                    onClick={handleLessonComplete}
                  >
                    <Check size={16} className="mr-1" />
                    {progress[currentLesson.id]?.completed
                      ? "Completed"
                      : "Mark Complete"}
                  </button>
                </div>

                <div className="text-gray-700 mb-6 whitespace-pre-line">
                  {currentLesson.description}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    disabled={!getPreviousLesson()}
                    onClick={() =>
                      getPreviousLesson() &&
                      handleLessonSelect(getPreviousLesson())
                    }
                    className="flex items-center"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Previous Lesson
                  </Button>

                  <Button
                    variant="outline"
                    disabled={!getNextLesson()}
                    onClick={() =>
                      getNextLesson() && handleLessonSelect(getNextLesson())
                    }
                    className="flex items-center"
                  >
                    Next Lesson
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Course Progress</span>
                    <span>{courseProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${courseProgress}%` }}
                    ></div>
                  </div>
                </div>

                <h3 className="font-semibold mb-4">Course Content</h3>

                <div className="space-y-4">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-md overflow-hidden"
                    >
                      <div className="bg-gray-50 p-3">
                        <h4 className="font-medium">{section.title}</h4>
                        <div className="text-sm text-gray-500">
                          {section.lessons?.length || 0} lessons {"\u2022"}
                          {formatDuration(
                            section.lessons?.reduce(
                              (total, lesson) => total + (lesson.duration || 0),
                              0
                            )
                          )}
                        </div>
                      </div>

                      <ul className="divide-y divide-gray-200">
                        {section.lessons?.map((lesson) => (
                          <li
                            key={lesson.id}
                            className={`p-3 cursor-pointer hover:bg-gray-50 ${
                              currentLesson?.id === lesson.id
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => handleLessonSelect(lesson)}
                          >
                            <div className="flex items-center">
                              {progress[lesson.id]?.completed ? (
                                <Check
                                  size={16}
                                  className="mr-2 text-green-500"
                                />
                              ) : (
                                <div className="w-4 h-4 mr-2 rounded-full border border-gray-300"></div>
                              )}
                              <div>
                                <h5 className="font-medium">{lesson.title}</h5>
                                <div className="text-sm text-gray-500">
                                  {formatDuration(lesson.duration)}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-bold mb-4">No lessons available</h2>
            <p className="mb-6">
              This course doesn&apos;t have any lessons yet.
            </p>
            <Button href={`/courses/${params.courseId}`} variant="primary">
              Back to Course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
