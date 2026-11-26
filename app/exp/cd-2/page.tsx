import type { Metadata } from 'next';
import { NOINDEX } from '../../../components/seo';
import Cd2Page from './Cd2Page';

/* /exp/cd-2: the Creative Director page told by the scroll (Cd2Page). */

export const metadata: Metadata = { title: 'Creative Director, scroll — Identity Labs', robots: NOINDEX };

export default function CreativeDirectorScrollPage() {
  return <Cd2Page />;
}
