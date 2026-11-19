import type { Metadata, Viewport } from 'next';
import { NOINDEX } from '../../../../components/seo';
import Film from '../../../../components/exp-cd/Film';
import '../../../../components/exp-cd/cd.css';
import '../../../../components/exp-cd/v2.css';

/* /exp/cd/v3 — the Creative Director film, variant 3 (mix: each reference in its own look). */

export const metadata: Metadata = {
  title: 'Creative Director — Identity Labs (experiment, variant 3)',
  robots: NOINDEX,
};

export const viewport: Viewport = { themeColor: '#d8402a' };

export default function CreativeDirectorFilmV3() {
  return <Film variant="3" />;
}
