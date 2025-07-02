// /components/UploadBox.js
"use client";

import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export default function UploadBox({
  userId,
  courseId,
  bucketName = "videos",
  folderPath = "uploads",
  acceptedFileTypes = "video/*",
  onUploadComplete = null,
  label = "Upload File",
  maxFileSizeMB = null,
}) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size if maxFileSizeMB is provided
    if (maxFileSizeMB && file.size > maxFileSizeMB * 1024 * 1024) {
      setMessage(`❌ Error: File size exceeds ${maxFileSizeMB}MB limit`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const filename = `${Date.now()}-${file.name}`;
      const filePath = folderPath ? `${folderPath}/${filename}` : filename;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        setMessage(`❌ Error: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      // If this is a video for a lesson, create the lesson record
      if (bucketName === "videos" && courseId) {
        const { error: insertError } = await supabase.from("lessons").insert({
          course_id: courseId,
          title: file.name.replace(/\.[^/.]+$/, ""),
          video_url: publicUrl,
          position: 1,
          is_free: false,
        });

        if (insertError) {
          setMessage(`❌ Database error: ${insertError.message}`);
          setLoading(false);
          return;
        }
      }

      // Call the callback with the file object if provided
      if (onUploadComplete && typeof onUploadComplete === "function") {
        onUploadComplete(file);
      }

      setMessage("✅ File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-dashed border-gray-400 p-8 rounded-lg text-center">
      <p className="mb-4">{label}</p>
      <button
        type="button"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => fileInputRef.current.click()}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Choose File"}
      </button>
      <input
        type="file"
        accept={acceptedFileTypes}
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        data-testid="file-input"
      />
      {maxFileSizeMB && (
        <p className="mt-2 text-xs text-gray-500">
          Maximum file size: {maxFileSizeMB}MB
        </p>
      )}
      {message && (
        <p
          className={`mt-4 ${
            message.startsWith("✅") ? "text-green-700" : "text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
