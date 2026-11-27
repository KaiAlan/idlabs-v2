import type { Metadata } from 'next';
import { NOINDEX } from '../../components/seo';
import './exp.css';

/* /exp: the index of experiments and old versions (behind the password, proxy.ts).
   A quiet list, grouped, name left and what it is on the right. */

export const metadata: Metadata = { title: 'Identity Labs — Experiments', robots: NOINDEX };

const GROUPS: { title: string; pages: [href: string, name: string, kind: string][] }[] = [
  {
    title: 'Home',
    pages: [
      ['/exp/home-4', 'Home 4', 'Option tabs'],
      ['/exp/home-4/classic', 'Home 4, classic', 'Loader'],
      ['/exp/home-3', 'Home 3', 'Immersive'],
      ['/exp/home-2', 'Home 2', 'Flowchart'],
      ['/exp/old-home', 'Old home', 'First version'],
    ],
  },
  {
    title: 'Sections',
    pages: [
      ['/exp/hero', 'Hero', 'Section'],
      ['/exp/cd', 'Creative Director', 'Option tabs'],
      ['/exp/cd-2', 'Creative Director', 'Told by the scroll'],
      ['/exp/cd-3', 'Creative Director', 'Editorial'],
      ['/exp/launches-2', 'Launches 2', 'Page'],
      ['/exp/footer', 'Footer', 'Variants'],
      ['/exp/temp', 'Section 2', 'Snapshot, v1'],
      ['/exp/temp2', 'Section 2', 'Snapshot, v2'],
    ],
  },
  {
    title: 'Studies',
    pages: [
      ['/exp/experiment', 'Experiment', 'Layout'],
      ['/exp/type-demo', 'Type demo', 'Typography'],
    ],
  },
];

export default function ExpIndex() {
  return (
    <main className="xi">
      <a className="wordmark xi-mark" href="/" aria-label="Identity Labs home">
        <span>Identity</span>
        <span className="wm-space"> </span>
        <em>Labs</em>
      </a>
      <header className="xi-head">
        <h1 className="xi-title">Experiments</h1>
        <p className="xi-sub">Earlier versions and work in progress, kept for reference</p>
      </header>
      {GROUPS.map((g) => (
        <section key={g.title} className="xi-group" aria-labelledby={`xi-${g.title}`}>
          <h2 id={`xi-${g.title}`} className="xi-group-title">{g.title}</h2>
          <ul className="xi-list">
            {g.pages.map(([href, name, kind]) => (
              <li key={href}>
                <a href={href} className="xi-row">
                  <span className="xi-name">{name}</span>
                  <span className="xi-kind">{kind}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
