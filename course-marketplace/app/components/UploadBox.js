// /components/UploadBox.js
"use client";

import { useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function UploadBox({ userId, courseId }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const filename = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("videos")
      .upload(`uploads/${filename}`, file);

    if (error) {
      setMessage("❌ Erreur : " + error.message);
      setLoading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("videos").getPublicUrl(`uploads/${filename}`);

    const { error: insertError } = await supabase.from("lessons").insert({
      course_id: courseId,
      title: file.name.replace(/\.[^/.]+$/, ""),
      video_url: publicUrl,
      position: 1,
      is_free: false,
    });

    if (insertError) {
      setMessage("❌ Erreur base de données : " + insertError.message);
    } else {
      setMessage("✅ Vidéo ajoutée avec succès !");
    }

    setLoading(false);
  };

  return (
    <div className="border border-dashed border-gray-400 p-8 rounded-lg text-center">
      <p className="mb-4">Cliquez pour importer une vidéo de leçon</p>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => fileInputRef.current.click()}
        disabled={loading}
      >
        {loading ? "Chargement..." : "Choisir une vidéo"}
      </button>
      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
      />
      {message && <p className="mt-4 text-green-700">{message}</p>}
    </div>
  );
}
