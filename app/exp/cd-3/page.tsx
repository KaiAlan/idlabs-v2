import type { Metadata } from 'next';
import { NOINDEX } from '../../../components/seo';
import Cd3Page from './Cd3Page';

/* /exp/cd-3: the Creative Director page, editorial (Cd3Page). */

export const metadata: Metadata = { title: 'Creative Director, editorial — Identity Labs', robots: NOINDEX };

export default function CreativeDirectorEditorialPage() {
  return <Cd3Page />;
}
