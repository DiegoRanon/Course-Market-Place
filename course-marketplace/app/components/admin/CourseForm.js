"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { createCourse, getAllCategories } from "@/app/lib/api/courses";
import { getAllCreators } from "@/app/lib/api/profiles";
import UploadBox from "@/app/components/UploadBox";
import { useAuth } from "@/app/lib/AuthProvider";
import VideoPlayer from "@/app/components/VideoPlayer";

// Define Supabase storage URL constants
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const STORAGE_URL = SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public/` : "";

export default function CourseForm() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [creators, setCreators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(""); // For UI preview only
  const [thumbnailStorageUrl, setThumbnailStorageUrl] = useState(""); // Actual storage URL
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    creator_id: "",
    category_id: "",
    price: 0,
    requirements: "",
    thumbnail_url: "",
    coursevideo_url: "",
  });
  const [validation, setValidation] = useState({
    title: true,
    description: true,
    creator_id: true,
    category_id: true,
  });

  useEffect(() => {
    const fetchCreators = async () => {
      const { data, error } = await getAllCreators();
      if (data) {
        setCreators(data);
      }
      if (error) {
        console.error("Error fetching creators:", error);
      }
    };

    const fetchCategories = async () => {
      const { data, error } = await getAllCategories();
      if (data) {
        setCategories(data);
      }
      if (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCreators();
    fetchCategories();
  }, []);

  // Helper function to ensure URL has proper HTTP prefix
  const ensureFullUrl = (url) => {
    if (!url) return "";
    
    // If URL already starts with http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative path in the bucket, prepend the storage URL
    if (url.includes('course-thumbnails/')) {
      return `${STORAGE_URL}${url}`;
    }
    
    // For other relative paths, assume they're in the course-thumbnails bucket
    return `${STORAGE_URL}course-thumbnails/${url.replace(/^\//, '')}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for thumbnail_url to ensure it has proper HTTP path
    if (name === 'thumbnail_url' && value) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear validation error when user starts typing
    if (!validation[name]) {
      setValidation((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  const handleThumbnailUpload = async (file) => {
    setThumbnailFile(file);

    try {
      // Upload the thumbnail file to Supabase storage with metadata
      const fileName = `${Date.now()}-${file.name}`;

      // Make sure we're authenticated
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Authentication session expired. Please login again.");
      }

      // Upload with metadata to help with RLS policies
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("course-thumbnails")
        .upload(fileName, file, {
          upsert: true,
          metadata: {
            role: profile?.role || "admin",
            user_id: user?.id,
          },
        });

      if (uploadError) {
        console.error("Thumbnail upload error:", uploadError);
        throw new Error(`Error uploading thumbnail: ${uploadError.message}`);
      }

      // Get the public URL for the uploaded thumbnail
      const { data: publicUrlData } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(fileName);

      // Store the actual storage URL separately from the preview URL
      const fullThumbnailUrl = publicUrlData.publicUrl;
      setThumbnailStorageUrl(fullThumbnailUrl);
      
      // Update formData with the actual storage URL
      setFormData(prev => ({
        ...prev,
        thumbnail_url: fullThumbnailUrl
      }));

      // Create a preview using FileReader for the UI only
      const reader = new FileReader();
      reader.onload = (e) => {
        // This is for preview in the UI only
        setThumbnailPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error in thumbnail upload:", error);
      setError(`Thumbnail upload failed: ${error.message}`);
    }
  };

  const handleVideoUpload = async (file) => {
    setVideoFile(file);

    try {
      // Upload the video file to Supabase storage with metadata
      const fileName = `${Date.now()}-${file.name}`;

      // Make sure we're authenticated
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Authentication session expired. Please login again.");
      }

      // Upload with metadata to help with RLS policies
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("course-videos")
        .upload(fileName, file, {
          upsert: true,
          metadata: {
            role: profile?.role || "admin",
            user_id: user?.id,
          },
        });

      if (uploadError) {
        console.error("Video upload error:", uploadError);
        throw new Error(`Error uploading video: ${uploadError.message}`);
      }

      // Get the public URL for the uploaded video
      const { data: publicUrlData } = supabase.storage
        .from("course-videos")
        .getPublicUrl(fileName);

      // Set the video URL to the public URL
      setVideoUrl(publicUrlData.publicUrl);
      
      // Also update formData with the video URL
      setFormData(prev => ({
        ...prev,
        coursevideo_url: publicUrlData.publicUrl
      }));

      // Also create a preview using FileReader for the UI
      const reader = new FileReader();
      reader.onload = (e) => {
        // This is just for preview in the UI, we'll use the actual URL for submission
        console.log("Video preview created");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error in video upload:", error);
      setError(`Video upload failed: ${error.message}`);
    }
  };

  const validateForm = () => {
    const newValidation = {
      title: !!formData.title.trim(),
      description: !!formData.description.trim(),
      creator_id: !!formData.creator_id,
      category_id: !!formData.category_id,
    };

    setValidation(newValidation);
    return Object.values(newValidation).every(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate form
    const validationErrors = validateForm();
    if (Object.values(validationErrors).some((valid) => !valid)) {
      setLoading(false);
      return;
    }

    try {
      // Prepare course data
      const courseData = {
        title: formData.title,
        description: formData.description,
        creator_id: formData.creator_id,
        category_id: formData.category_id,
        price: parseFloat(formData.price) || 0,
        requirements_json: formData.requirements
          ? JSON.stringify(formData.requirements.split("\n").filter(Boolean))
          : JSON.stringify([]),
      };

      // Use the storage URL for thumbnail, not the data URL
      if (thumbnailStorageUrl) {
        courseData.thumbnail_url = thumbnailStorageUrl;
      } else if (formData.thumbnail_url) {
        courseData.thumbnail_url = ensureFullUrl(formData.thumbnail_url);
      }

      // Add video URL if available
      if (videoUrl) {
        courseData.coursevideo_url = videoUrl;
      } else if (formData.coursevideo_url && formData.coursevideo_url.startsWith("http")) {
        courseData.coursevideo_url = formData.coursevideo_url;
      }

      // Add admin ID if user is admin
      if (profile?.role === "admin") {
        courseData.admin_id = profile.id;
      }

      console.log("Creating course with data:", courseData);

      // Create course
      const { data, error } = await createCourse(courseData);

      if (error) {
        // If the error is related to the 'requirements' column, try again without it
        if (error.message && error.message.includes("requirements")) {
          console.log("Retrying without requirements field");

          // Remove the requirements_json field and try again
          delete courseData.requirements_json;

          // Try creating the course again
          const retryResult = await createCourse(courseData);

          if (retryResult.error) {
            throw new Error(
              `Error creating course: ${retryResult.error.message}`
            );
          }

          // Success on retry
          setSuccess(true);
          setFormData({
            title: "",
            description: "",
            creator_id: "",
            category_id: "",
            price: 0,
            requirements: "",
            thumbnail_url: "",
            coursevideo_url: "",
          });

          // Reset file states
          setThumbnailFile(null);
          setThumbnailPreviewUrl("");
          setThumbnailStorageUrl("");
          setVideoFile(null);
          setVideoUrl("");

          // Redirect after a delay
          setTimeout(() => {
            router.push("/admin/courses");
          }, 2000);

          return;
        }

        throw new Error(`Error creating course: ${error.message}`);
      }

      // Success
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        creator_id: "",
        category_id: "",
        price: 0,
        requirements: "",
        thumbnail_url: "",
        coursevideo_url: "",
      });

      // Reset file states
      setThumbnailFile(null);
      setThumbnailPreviewUrl("");
      setThumbnailStorageUrl("");
      setVideoFile(null);
      setVideoUrl("");

      // Redirect after a delay
      setTimeout(() => {
        router.push("/admin/courses");
      }, 2000);
    } catch (err) {
      console.error("Error in form submission:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Course created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              !validation.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Course Title"
          />
          {!validation.title && (
            <p className="text-red-500 text-sm mt-1">Title is required</p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              !validation.description ? "border-red-500" : "border-gray-300"
            }`}
            rows="5"
            placeholder="Course Description"
          ></textarea>
          {!validation.description && (
            <p className="text-red-500 text-sm mt-1">Description is required</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">
              Creator <span className="text-red-500">*</span>
            </label>
            <select
              name="creator_id"
              className={`w-full p-2 border rounded ${
                !validation.creator_id ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.creator_id}
              onChange={handleChange}
              data-testid="creator-select"
            >
              <option value="">Select Creator</option>
              {creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.full_name}
                </option>
              ))}
            </select>
            {!validation.creator_id && (
              <p className="text-red-500 text-sm mt-1">Creator is required</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category_id"
              className={`w-full p-2 border rounded ${
                !validation.category_id ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.category_id}
              onChange={handleChange}
              data-testid="category-select"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {!validation.category_id && (
              <p className="text-red-500 text-sm mt-1">Category is required</p>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Price ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Requirements</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
            placeholder="Enter each requirement on a new line"
          ></textarea>
          <p className="text-sm text-gray-500 mt-1">
            Enter each requirement on a new line
          </p>
        </div>

        <div>
          <label className="block mb-2 font-medium">Course Thumbnail</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <UploadBox
                userId={user?.id}
                bucketName="course-thumbnails"
                folderPath=""
                acceptedFileTypes="image/*"
                onUploadComplete={handleThumbnailUpload}
                label="Upload Thumbnail"
                maxFileSizeMB={5}
                data-testid="thumbnail-upload"
              />
              <p className="text-sm text-gray-500 mt-1">
                Recommended size: 1280x720px (16:9 ratio)
              </p>
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  name="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter thumbnail URL (if not uploading)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URLs should start with http:// or https:// for proper display
                </p>
                {thumbnailStorageUrl && (
                  <p className="text-xs text-green-600 mt-1">
                    Storage URL: {thumbnailStorageUrl}
                  </p>
                )}
              </div>
            </div>
            {thumbnailPreviewUrl && (
              <div className="relative aspect-video border rounded overflow-hidden">
                <img
                  src={thumbnailPreviewUrl}
                  alt="Thumbnail Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Course Video</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <UploadBox
                userId={user?.id}
                bucketName="course-videos"
                folderPath=""
                acceptedFileTypes="video/mp4,video/webm,video/ogg"
                onUploadComplete={handleVideoUpload}
                label="Upload Video"
                maxFileSizeMB={500}
                data-testid="video-upload"
              />
              <p className="text-sm text-gray-500 mt-1">
                Accepted formats: MP4, WebM, OGG (Max 500MB)
              </p>
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium">
                  Video URL
                </label>
                <input
                  type="text"
                  name="coursevideo_url"
                  value={formData.coursevideo_url}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter video URL (if not uploading)"
                />
                {videoUrl && (
                  <p className="text-xs text-green-600 mt-1">
                    Storage URL: {videoUrl}
                  </p>
                )}
              </div>
            </div>
            {videoUrl && (
              <div className="relative aspect-video border rounded overflow-hidden">
                <video
                  src={videoUrl}
                  controls
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
