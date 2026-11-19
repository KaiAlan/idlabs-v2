import type { Metadata, Viewport } from 'next';
import { NOINDEX } from '../../../../components/seo';
import Film from '../../../../components/exp-cd/Film';
import '../../../../components/exp-cd/cd.css';
import '../../../../components/exp-cd/v2.css';

/* /exp/cd/v1 — the Creative Director film, variant 1 (collage, after the first reference reel). */

export const metadata: Metadata = {
  title: 'Creative Director — Identity Labs (experiment, variant 1)',
  robots: NOINDEX,
};

export const viewport: Viewport = { themeColor: '#1a1a1a' };

export default function CreativeDirectorFilmV1() {
  return <Film variant="1" />;
}
