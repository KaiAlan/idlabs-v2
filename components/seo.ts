/* Search and answer-engine basics (2026-11-17): the site's public address, the pages that are
   meant to be found (sitemap.ts), and the schema.org nodes shared by the pages' JSON-LD.
   Experimental routes (/home-2, /hero, /temp …) are left out of the sitemap and set noindex
   (NOINDEX, in each of their metadata). */

export const SITE_URL = 'https://identitylabs.com';

// the pages search engines should know, for sitemap.ts; Manifesto and Careers join once written
export const MAIN_PAGES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/launches', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/careers', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/careers/creative-director', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/careers/head-of-growth', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/careers/thinker-writer', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

// metadata for pages that should stay out of search (experiments, snapshots, placeholders)
export const NOINDEX = { index: false, follow: false } as const;

// JSON in a script tag: "<" escaped so no value can close the tag
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

export const ORG_ID = `${SITE_URL}/#organization`;

// the Organization node, as the team sent it for /about (components/about/content.ts); the home page uses it too
export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Identity Labs',
  url: SITE_URL,
  description:
    "Identity Labs is a growth consulting firm that helps the world's largest technology companies build predictable organic distribution through algorithm research, predictive analytics and creative teams embedded inside their organizations.",
  foundingDate: '2022-03',
  founder: [{ '@id': 'https://ruchirjajoo.com/#person' }, { '@id': 'https://vedikabhaia.com/#person' }],
  location: [
    { '@type': 'Place', name: 'San Francisco' },
    { '@type': 'Place', name: 'London' },
    { '@type': 'Place', name: 'Bangalore' },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '50 California Street',
    addressLocality: 'San Francisco',
    postalCode: '94111',
    addressCountry: 'US',
  },
  knowsAbout: ['Organic distribution', 'Algorithm research', 'Predictive analytics', 'Product launches', 'Executive brand'],
  sameAs: [
    'https://www.wikidata.org/wiki/Q142031928',
    'https://www.crunchbase.com/organization/identity-labs-046c',
    'https://www.linkedin.com/company/theidentitylabs',
    'https://x.com/identitylabsinc',
  ],
};

// Social Capital Inc., the launch firm that merged into Identity Labs (October 2026)
export const SOCIAL_CAPITAL = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#socialcapital`,
  name: 'Social Capital Inc.',
  foundingDate: '2023-07',
  dissolutionDate: '2026-10',
  founder: [{ '@id': 'https://ruchirjajoo.com/#person' }, { '@id': 'https://vedikabhaia.com/#person' }],
  description: 'Launch firm founded by Ruchir Jajoo and Vedika Bhaia in July 2023; merged into Identity Labs in October 2026.',
  sameAs: ['https://www.wikidata.org/wiki/Q142089203', 'https://www.linkedin.com/company/socialcapital-inc', 'https://x.com/socapinc'],
};

// the home page's graph: the organization and the website it publishes
export const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    ORGANIZATION,
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Identity Labs',
      publisher: { '@id': ORG_ID },
    },
  ],
};
