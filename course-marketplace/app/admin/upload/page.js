// /app/admin/upload/page.js (App Router + RSC + Supabase)
<<<<<<< HEAD
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import UploadBox from '@/app/components/UploadBox';
=======
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import UploadBox from "@/app/components/UploadBox";
>>>>>>> a03a26d2af55c5f33deeae033e3e72b8479fe88e

export default async function UploadPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*if (!user) {
    //return <div className="p-8 text-red-600">Vous devez être connecté</div>;
  }

  <UploadBox userId={user.id} />

  const { data: profile } = await supabase
    .from("profiles") // ou "users" selon ta DB
    .select("role")
    .eq("id", user.id)
    .single();

<<<<<<< HEAD
  if (profile?.role !== 'admin') {
    return <div className="p-8 text-red-600">Accès réservé aux administrateurs</div>;
  }*/
=======
  if (profile?.role !== "admin") {
    return (
      <div className="p-8 text-red-600">Accès réservé aux administrateurs</div>
    );
  }
>>>>>>> a03a26d2af55c5f33deeae033e3e72b8479fe88e

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Importer une vidéo</h1>
<UploadBox />
    </div>
  );
}
