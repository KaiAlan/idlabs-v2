import type { Metadata, Viewport } from 'next';
import { NOINDEX } from '../../../../components/seo';
import Film from '../../../../components/exp-cd/Film';
import '../../../../components/exp-cd/cd.css';
import '../../../../components/exp-cd/v2.css';

/* /exp/cd/v6 — the Creative Director film, variant 6 (site: the sketchbook storyline in the Identity Labs site style). */

export const metadata: Metadata = {
  title: 'Creative Director — Identity Labs (experiment, variant 6)',
  robots: NOINDEX,
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function CreativeDirectorFilmV6() {
  return <Film variant="6" />;
}
