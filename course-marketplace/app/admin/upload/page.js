// /app/admin/upload/page.js (App Router + RSC + Supabase)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import UploadBox from '@/app/components/UploadBox';

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
    .from('profiles') // ou "users" selon ta DB
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return <div className="p-8 text-red-600">Accès réservé aux administrateurs</div>;
  }*/

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Importer une vidéo</h1>
<UploadBox />
    </div>
  );
}
