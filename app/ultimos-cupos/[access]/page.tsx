import { notFound, redirect } from 'next/navigation';
import { LAST_SPOTS_ACCESS, LAST_SPOTS_PATH } from '@/lib/last-spots-window';
export default async function Page({ params }: { params: Promise<{ access: string }> }) {
  const { access } = await params;
  if (access !== LAST_SPOTS_ACCESS) notFound();
  redirect(LAST_SPOTS_PATH);
}
