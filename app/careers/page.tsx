import type { Metadata } from 'next';
import CareersPage from '../../components/careers/CareersPage';
import { SITE_URL } from '../../components/seo';

/* /careers (2026-11-27), variant A: the /about and legal pages' white page (rails, ticks, the fixed
   chrome, the Fibonacci footer), its 512px column. The title, the pitch in the mono caps
   (its figures in ink over the grey), and the three open roles as small dithered cards within the column (RoleCards). The body is
   components/careers/CareersPage.tsx; the large-cards variant is /exp/careers, the scroll-told one /exp/careers-2. */

const DESCRIPTION =
  'Identity Labs has grown 7x in revenue to $20M ARR. We will soon get to $100M revenue with 30 people, 12 spots left. Open roles: Creative Director, Head of Growth, Thinker-Writer.';

export const metadata: Metadata = {
  title: 'Careers | Identity Labs',
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/careers` },
  openGraph: { title: 'Careers | Identity Labs', description: DESCRIPTION, url: '/careers' },
};

export default function Careers() {
  return <CareersPage cards="small" />;
}
