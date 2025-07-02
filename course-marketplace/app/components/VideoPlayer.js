"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
  Loader,
} from "lucide-react";

export default function VideoPlayer({
  videoUrl,
  courseId,
  lessonId,
  userId,
  onProgress,
  isCourseVideo = false,
  autoPlay = false,
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [secureVideoUrl, setSecureVideoUrl] = useState(null);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState("initializing"); // initializing, fetching, buffering, ready

  // Timer for hiding controls
  const controlsTimerRef = useRef(null);
  // Timer for saving progress
  const saveProgressTimerRef = useRef(null);
  // Last reported progress time
  const lastReportedTimeRef = useRef(0);
  // Was playing before tab became hidden
  const wasPlayingRef = useRef(false);

  // Show/hide controls on mouse movement - with throttling
  const lastMoveTimeRef = useRef(0);

  useEffect(() => {
    if (videoUrl) {
      getVideoUrl();
    } else {
      setError("No video URL provided");
      setIsLoading(false);
      setLoadingPhase("error");
    }

    return () => {
      // Clear timers on unmount
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      if (saveProgressTimerRef.current)
        clearInterval(saveProgressTimerRef.current);
    };
  }, [videoUrl]);

  // Handle Page Visibility API for tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      setIsTabVisible(isVisible);
      
      // If tab becomes hidden, pause video and store playing state
      if (!isVisible && videoRef.current) {
        wasPlayingRef.current = !videoRef.current.paused;
        if (wasPlayingRef.current) {
          videoRef.current.pause();
        }
        
        // Clear any active timers when tab is hidden
        if (controlsTimerRef.current) {
          clearTimeout(controlsTimerRef.current);
        }
        if (saveProgressTimerRef.current) {
          clearInterval(saveProgressTimerRef.current);
        }
      } 
      // If tab becomes visible again and was playing before, resume
      else if (isVisible && videoRef.current && wasPlayingRef.current) {
        videoRef.current.play()
          .catch(err => console.log("Could not auto-resume video:", err));
        wasPlayingRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Get secure URL for video
  const getVideoUrl = async () => {
    try {
      setIsLoading(true);
      setLoadingPhase("fetching");
      setError(null);

      if (!videoUrl) {
        setError("No video URL provided");
        setIsLoading(false);
        setLoadingPhase("error");
        return;
      }

      console.log("Processing video URL:", videoUrl);

      // If it's already a full URL (like a YouTube embed or direct course video URL)
      if (videoUrl.startsWith("http")) {
        console.log("Using direct URL:", videoUrl);
        setSecureVideoUrl(videoUrl);
        setIsLoading(true); // Keep loading until the video is ready to play
        setLoadingPhase("buffering");
        return;
      }

      // Get bucket name based on video type
      const bucketName = isCourseVideo ? "course-videos" : "videos";
      console.log(`Using bucket: ${bucketName} for path: ${videoUrl}`);

      // Get public URL for course videos (they have public access)
      if (isCourseVideo) {
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${videoUrl}`;
        console.log("Generated public URL:", publicUrl);
        setSecureVideoUrl(publicUrl);
        setIsLoading(true); // Keep loading until the video is ready to play
        setLoadingPhase("buffering");
        return;
      }

      // Otherwise, get a signed URL from Supabase storage for protected videos
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(videoUrl, 3600); // 1 hour expiry

      if (error) {
        console.error("Error getting signed URL:", error);
        setError(`Error loading video: ${error.message}`);
        setIsLoading(false);
        setLoadingPhase("error");
        return;
      }

      console.log("Generated signed URL for video");
      setSecureVideoUrl(data.signedUrl);
      setIsLoading(true); // Keep loading until the video is ready to play
      setLoadingPhase("buffering");
    } catch (err) {
      console.error("Error getting video URL:", err);
      setError(`Error loading video: ${err.message}`);
      setIsLoading(false);
      setLoadingPhase("error");
    }
  };

  // Initialize video event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !secureVideoUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      
      // Check if we have a saved progress
      loadProgress();
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setLoadingPhase("ready");
      
      // If autoPlay is enabled, start playing
      if (autoPlay) {
        videoElement.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error("Error auto-playing video:", err);
            // Don't set error state as the video is still playable manually
          });
      }
    };
    
    const handleWaiting = () => {
      setIsLoading(true);
      setLoadingPhase("buffering");
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setLoadingPhase("ready");
      setIsPlaying(true);
    };

    const handleError = (event) => {
      console.error("Video error:", videoElement.error);
      setError(`Failed to load video: ${videoElement.error?.message || "Unknown error"}`);
      setIsLoading(false);
      setLoadingPhase("error");
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);

      // Track progress
      if (userId && lessonId && onProgress) {
        // Only report progress every 5 seconds or if > 3% change
        const currentProgressPercent =
          (videoElement.currentTime / videoElement.duration) * 100;
        const lastProgressPercent =
          (lastReportedTimeRef.current / videoElement.duration) * 100;

        if (
          videoElement.currentTime - lastReportedTimeRef.current > 5 ||
          Math.abs(currentProgressPercent - lastProgressPercent) > 3
        ) {
          saveProgress(videoElement.currentTime);
          lastReportedTimeRef.current = videoElement.currentTime;
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);

      // Mark as completed if we have progress tracking
      if (userId && lessonId && onProgress) {
        onProgress(videoElement.duration, true); // true = completed
      }
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("waiting", handleWaiting);
    videoElement.addEventListener("playing", handlePlaying);
    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("waiting", handleWaiting);
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [secureVideoUrl, userId, lessonId, autoPlay]);

  // Load saved progress
  const loadProgress = async () => {
    if (!userId || !lessonId) return;

    try {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.watch_time > 0) {
        // Only seek if the progress is less than 95% of the video
        if (
          videoRef.current &&
          data.watch_time < videoRef.current.duration * 0.95
        ) {
          videoRef.current.currentTime = data.watch_time;
          setCurrentTime(data.watch_time);
        }
      }
    } catch (err) {
      console.error("Error loading progress:", err);
    }
  };

  // Save progress
  const saveProgress = async (time) => {
    if (!userId || !lessonId || !onProgress) return;

    // Call the onProgress callback
    onProgress(time);
  };

  // Play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch((err) => {
        console.error("Error playing video:", err);
      });
      setIsPlaying(true);
    }
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // Mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        // Store current volume before muting
        videoRef.current.dataset.prevVolume = volume;
        setVolume(0);
        videoRef.current.volume = 0;
      } else {
        // Restore previous volume
        const prevVolume = parseFloat(
          videoRef.current.dataset.prevVolume || 0.7
        );
        setVolume(prevVolume);
        videoRef.current.volume = prevVolume;
      }
    }
  };

  // Seek on progress bar click
  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = duration * pos;

    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);

    // If seeking while paused, save the progress
    if (!isPlaying && userId && lessonId && onProgress) {
      saveProgress(seekTime);
      lastReportedTimeRef.current = seekTime;
    }
  };

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Format time to mm:ss or hh:mm:ss
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Show/hide controls on mouse movement - with throttling
  const handleMouseMove = () => {
    // Throttle the mouse move handler to prevent excessive updates
    const now = Date.now();
    if (now - lastMoveTimeRef.current < 100) return; // Only process every 100ms
    lastMoveTimeRef.current = now;

    // Only update state if controls are currently hidden
    if (!showControls) {
      setShowControls(true);
    }

    // Clear any existing timer
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    // Set a new timer to hide controls after 3 seconds
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying && isTabVisible) { // Only hide when tab is visible and playing
        setShowControls(false);
      }
    }, 3000);
  };

  // Helper to hide controls with delay
  const hideControlsTimer = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying && isTabVisible) { // Only hide when tab is visible and playing
        setShowControls(false);
      }
    }, 3000);
  };

  // Render loading state
  const renderLoadingState = () => {
    let message = "";
    
    switch(loadingPhase) {
      case "fetching":
        message = "Preparing video...";
        break;
      case "buffering":
      default:
        message = "Loading video...";
    }
    
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10" data-testid="video-loading">
        <div className="text-center">
          <Loader className="w-10 h-10 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-white text-lg">{message}</p>
        </div>
      </div>
    );
  };

  // Render error state
  const renderErrorState = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
        <div className="text-center max-w-sm mx-auto p-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-white text-lg mb-4">
            {error || "Failed to load video"}
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              setLoadingPhase("fetching");
              getVideoUrl();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="relative bg-black text-white flex items-center justify-center h-full w-full min-h-[200px]">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2" data-testid="error-title">
            Error loading video
          </p>
          <p className="text-sm" data-testid="error-message">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={playerRef}
      className={`video-player relative overflow-hidden ${
        isFullScreen ? "fixed inset-0 z-50 bg-black" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          hideControlsTimer();
        }
      }}
    >
      {isLoading && renderLoadingState()}

      {error && !isLoading && renderErrorState()}

      {!error && (
        <video
          ref={videoRef}
          src={secureVideoUrl}
          className="w-full h-full object-contain"
          preload="metadata"
          playsInline
          data-testid="video-element"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Video controls */}
      {!error && secureVideoUrl && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-4 py-2 transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress bar */}
          <div
            className="relative h-1 bg-gray-600 cursor-pointer mb-2"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-purple-500"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play/Pause button */}
              <button
                onClick={togglePlay}
                className="text-white focus:outline-none"
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6m-9-3a9 9 0 1118 0 9 9 0 01-18 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </button>

              {/* Volume control */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={toggleMute}
                  className="text-white focus:outline-none"
                >
                  {isMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        clipRule="evenodd"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Time display */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullScreen}
              className="text-white focus:outline-none"
            >
              {isFullScreen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9L4 4m0 0l5 0m-5 0l0 5M9 15l-5 5m0 0l0-5m0 5l5 0M15 9l5-5m0 0l-5 0m5 0l0 5m0 6l-5 5m0 0l5 0m-5 0l0-5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
