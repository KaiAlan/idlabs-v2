import type { Metadata, Viewport } from 'next';
import Office from '../../../components/office/Office';

/* /exp/office — experiment: the studio in 3D, entered by scrolling (after venice.inc/about).
   Not linked from the site and kept out of search. */

export const metadata: Metadata = {
  title: 'Identity Labs — the studio',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function OfficePage() {
  return <Office />;
}
