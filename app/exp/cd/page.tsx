import type { Metadata } from 'next';
import { NOINDEX } from '../../../components/seo';
import CdPage from './CdPage';

/* /exp/cd: the Creative Director page (CdPage). Its hero's clients switch with the tabs at the bottom
   (?clients=names|logos). */

export const metadata: Metadata = { title: 'Creative Director — Identity Labs', robots: NOINDEX };

export default function CreativeDirectorPage() {
  return <CdPage />;
}
