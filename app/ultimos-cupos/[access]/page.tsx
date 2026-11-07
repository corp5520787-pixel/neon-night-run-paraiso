import { notFound } from 'next/navigation';
import RegistroPage from '@/components/RegistroForm';
import { LAST_SPOTS_ACCESS } from '@/lib/last-spots-window';
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ access: string }> }) {
  const { access } = await params;
  if (access !== LAST_SPOTS_ACCESS) notFound();
  return <RegistroPage specialAccessToken={access} />;
}
