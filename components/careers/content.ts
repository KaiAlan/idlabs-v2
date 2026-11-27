/* /careers and /exp/careers-2: the pitch (word for word, as the founders wrote it, 2026-11-27) and the
   three open roles. href: the role's page here (the long reads, EdRole); apply: the Notion posting. */

export const PITCH = [
  'In the last 2 years, $1T was spent on paid marketing on Meta and Google. Paid reach is getting more expensive with diminishing returns.',
  'Companies now need organic distribution faster than we can hire and build systems to provide it. Identity Labs has grown 7x in revenue to $20M ARR because of this demand.',
  'We will soon get to $100M revenue with 30 people, 12 spots left: We’re hiring engineers, creative directors, thinker-writers, heads of growth, consultants, designers, and any outlier twitter-native person to work on hands-on with our clients. Join us.',
];

// the figures in the pitch, set large; each label is the pitch's own words
export const FIGURES = [
  { value: '$1T', label: 'spent on paid marketing on Meta and Google' },
  { value: '7x', label: 'in revenue' },
  { value: '$20M', label: 'ARR' },
  { value: '12', label: 'spots left' },
];

// the people we hire, from the pitch's last paragraph
export const HIRING = [
  'engineers',
  'creative directors',
  'thinker-writers',
  'heads of growth',
  'consultants',
  'designers',
  'any outlier twitter-native person',
];

// the cold-email address on the role pages (the address the site already gives, /privacy and /terms)
export const CAREERS_EMAIL = 'ruchir@identity-labs.com';

export type Role = { n: string; title: string; href: string; apply: string };

export const ROLES: Role[] = [
  { n: '01', title: 'Creative Director', href: '/careers/creative-director', apply: 'https://identitylab.notion.site/Creative-Director-at-a-Potential-1B-Startup-3fbac327b7b780748932db56fbd3a963' },
  { n: '02', title: 'Head of Growth', href: '/careers/head-of-growth', apply: 'https://identitylab.notion.site/Head-of-Growth-at-a-Potential-1B-Startup-3ffac327b7b7805e855be65177bac10c' },
  { n: '03', title: 'Thinker-Writer', href: '/careers/thinker-writer', apply: 'https://identitylab.notion.site/Thinker-Writer-at-a-Potential-1B-Startup-2b6ac327b7b781e5bc8bec6840e86363' },
];

// the figures and phrases to set in ink within the pitch's grey (variant A)
export const MARKS = ['$1T', '7x', '$20M ARR', '$100M', '30 people', '12 spots left', 'Join us.'];
