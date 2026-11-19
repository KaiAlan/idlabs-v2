import type { Metadata, Viewport } from 'next';
import { NOINDEX } from '../../../../components/seo';
import Film from '../../../../components/exp-cd/Film';
import '../../../../components/exp-cd/cd.css';
import '../../../../components/exp-cd/v2.css';

/* /exp/cd/v4 — the Creative Director film, variant 4 (the file: a documentary case file). */

export const metadata: Metadata = {
  title: 'Creative Director — Identity Labs (experiment, variant 4)',
  robots: NOINDEX,
};

export const viewport: Viewport = { themeColor: '#121110' };

export default function CreativeDirectorFilmV4() {
  return <Film variant="4" />;
}
