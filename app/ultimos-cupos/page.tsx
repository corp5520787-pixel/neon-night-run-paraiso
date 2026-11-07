import RegistroPage from '@/components/RegistroForm';
import { LAST_SPOTS_ACCESS } from '@/lib/last-spots-window';
export const metadata = { robots: { index: false, follow: false } };
export default function Page() { return <RegistroPage specialAccessToken={LAST_SPOTS_ACCESS} />; }
