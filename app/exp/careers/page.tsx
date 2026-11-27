import type { Metadata } from 'next';
import CareersPage from '../../../components/careers/CareersPage';
import { NOINDEX } from '../../../components/seo';

/* /careers, variant: the three role cards large, breaking out of the 512px column to 1000px, each its dithered clip,
   the name in Season Mix, a line, and "View role" with the arrow in a box. (/careers had these until 2026-11-27.) */

export const metadata: Metadata = { title: 'Careers, large cards — Identity Labs', robots: NOINDEX };

export default function CareersLarge() {
  return <CareersPage cards="large" />;
}
