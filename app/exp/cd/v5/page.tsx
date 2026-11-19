import type { Metadata, Viewport } from 'next';
import { NOINDEX } from '../../../../components/seo';
import Film from '../../../../components/exp-cd/Film';
import '../../../../components/exp-cd/cd.css';
import '../../../../components/exp-cd/v2.css';

/* /exp/cd/v5 — the Creative Director film, variant 5 (sketchbook: the storyline of the sketch reference). */

export const metadata: Metadata = {
  title: 'Creative Director — Identity Labs (experiment, variant 5)',
  robots: NOINDEX,
};

export const viewport: Viewport = { themeColor: '#ddd5c6' };

export default function CreativeDirectorFilmV5() {
  return <Film variant="5" />;
}
