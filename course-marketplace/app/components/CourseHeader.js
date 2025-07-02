"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "./ui/Button";
import { useAuth } from "../lib/AuthProvider";
import { Clock, Users, Star, User } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

export default function CourseHeader({ course, onEnroll }) {
  const { user } = useAuth();
  const [instructorProfile, setInstructorProfile] = useState(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [creatorError, setCreatorError] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (course) {
      // Use total_students from course if available
      if (course.total_students !== undefined) {
        setEnrollmentCount(course.total_students);
      }

      // Use creator info from course if available
      if (course.creator) {
        console.log("Using provided creator info:", course.creator);
        setInstructorProfile(course.creator);
      } else if (course.creator_id) {
        console.log("Fetching creator with ID:", course.creator_id);
        fetchCreator();
      } else {
        console.log("No creator_id available in course object");
      }
    }
  }, [course]);

  const fetchCreator = async () => {
    try {
      if (!course?.creator_id) {
        console.log("No creator_id provided");
        return;
      }

      console.log("Fetching creator profile for ID:", course.creator_id);

      // Method 4: Fallback to hardcoded creator name from course if available
      if (course.instructor || course.instructor_name) {
        console.log("Using fallback instructor name from course");
        setInstructorProfile({
          full_name:
            course.instructor || course.instructor_name || "Instructor",
          avatar_url: course.instructor_avatar || null,
        });
        return;
      }

      console.log("All methods failed to fetch creator profile");
      setCreatorError(
        "Could not load creator profile - possible RLS policy issue"
      );
    } catch (err) {
      console.error("Exception fetching creator profile:", err);
      setCreatorError(`Exception: ${err.message}`);
    }
  };

  const formatTotalDuration = (seconds) => {
    if (!seconds) return "-- hours";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minutes`;
    }
  };

  const getAvatarUrl = (profile) => {
    if (!profile || !profile.avatar_url) {
      return "/default-avatar.png"; // Fallback image
    }

    // If it's already a full URL
    if (profile.avatar_url.startsWith("http")) {
      return profile.avatar_url;
    }

    // If it's a storage path in user-avatars bucket
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-avatars/${profile.avatar_url}`;
  };

  const handleEnrollClick = () => {
    onEnroll();
  };

  const renderEnrollmentButton = () => {
    return (
      <Button
        variant="primary"
        size="lg"
        className="w-full md:w-auto"
        onClick={handleEnrollClick}
      >
        {course.price > 0
          ? `Enroll for $${parseFloat(course.price).toFixed(2)}`
          : "Enroll for Free"}
      </Button>
    );
  };

  // Get instructor name from available sources
  const getInstructorName = () => {
    if (instructorProfile?.full_name) {
      return instructorProfile.full_name;
    }
    if (course.instructor) {
      return course.instructor;
    }
    return "Unnamed Instructor";
  };

  const toggleVideoPreview = () => {
    setShowVideo(!showVideo);
  };

  if (!course) return null;

  return (
    <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-6 md:mb-0 md:mr-8 md:flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {course.title}
            </h1>
            <p className="text-lg mb-6">
              {course.short_description ||
                course.description?.substring(0, 150)}
              {course.description?.length > 150 ? "..." : ""}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                <span>{formatTotalDuration(course.total_duration || 0)}</span>
              </div>
              <div className="flex items-center">
                <Users size={18} className="mr-2" />
                <span>{enrollmentCount} students</span>
              </div>
              {course.rating && (
                <div className="flex items-center">
                  <Star
                    size={18}
                    className="mr-2 text-yellow-300 fill-yellow-300"
                  />
                  <span>{course.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Always display instructor section with available information */}
            <div className="flex items-center mb-6">
              <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                {instructorProfile ? (
                  <Image
                    src={getAvatarUrl(instructorProfile)}
                    alt={getInstructorName()}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <User size={20} className="text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <span className="text-sm opacity-80">Instructor</span>
                <h3 className="font-medium">{getInstructorName()}</h3>
                {creatorError && (
                  <p className="text-xs text-red-300">
                    <span title={creatorError}>Error loading creator info</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">{renderEnrollmentButton()}</div>
          </div>

          <div className="md:w-2/5 lg:w-1/3">
            {course.video_url && showVideo ? (
              <div
                className="relative rounded-lg overflow-hidden shadow-xl aspect-video"
                data-testid="course-video-container"
              >
                <VideoPlayer videoUrl={course.video_url} isCourseVideo={true} />
                <span className="hidden" data-testid="video-url">
                  {course.video_url}
                </span>
              </div>
            ) : course.thumbnail_url ? (
              <div className="relative rounded-lg overflow-hidden shadow-xl aspect-video">
                <Image
                  src={
                    course.thumbnail_url.startsWith("http")
                      ? course.thumbnail_url
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-thumbnails/${course.thumbnail_url}`
                  }
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                {course.video_url && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
                    onClick={toggleVideoPreview}
                    data-testid="video-play-button"
                  >
                    <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-purple-700"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
