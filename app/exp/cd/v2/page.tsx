import type { Metadata, Viewport } from 'next';
import { NOINDEX } from '../../../../components/seo';
import Film from '../../../../components/exp-cd/Film';
import '../../../../components/exp-cd/cd.css';
import '../../../../components/exp-cd/v2.css';

/* /exp/cd/v2 — the Creative Director film, variant 2 (red, after the second set of references). */

export const metadata: Metadata = {
  title: 'Creative Director — Identity Labs (experiment, variant 2)',
  robots: NOINDEX,
};

export const viewport: Viewport = { themeColor: '#d8402a' };

export default function CreativeDirectorFilmV2() {
  return <Film variant="2" />;
}
