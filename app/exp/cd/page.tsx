import type { Metadata, Viewport } from 'next';
import { NOINDEX } from '../../../components/seo';
import Film from '../../../components/exp-cd/Film';
import '../../../components/exp-cd/cd.css';
import '../../../components/exp-cd/v2.css';

/* /exp/cd — the Creative Director role page as a short film rather than a page (experiment,
   2026-11-19). Five storyboard scenes, paper-collage motion after the team's reference reel;
   voiced (public/exp/cd/vo.mp3). /exp/cd is the latest variant; /exp/cd/v1 and /exp/cd/v2 each one.
   Not linked from the site. */

export const metadata: Metadata = {
  title: 'Creative Director — Identity Labs (experiment)',
  robots: NOINDEX,
};

export const viewport: Viewport = { themeColor: '#efebe2' };

export default function CreativeDirectorFilm() {
  return <Film variant="6" />;
}
