'use client';

import OptionTabs, { useOption } from '../../../components/flow/OptionTabs';

/* /exp/cd's hero tabs (the bar /exp/home-4 uses, OptionTabs): the clients by name (Names: Venice's
   hover, a name turning into its logo) or as on the home page (Logos: HeroVertical's card, "Our
   Clients", twelve logos, two turning over). ?clients=title|names|logos (title, the names at the headline's size, is the default), read before first paint by the
   page's script into html[data-cd-clients], which shows one block and hides the other (cd.css). Shown
   while the hero fills most of the screen. And the margin lines with their squares, on or off for the
   whole page (off by default; ?lines=on, html[data-cd-lines]). */

type Clients = 'names' | 'title' | 'logos';
type Lines = 'on' | 'off';
const LINES: [Lines, string][] = [['off', 'No lines'], ['on', 'Lines']];
const CLIENTS: [Clients, string][] = [['title', 'Names at title size'], ['names', 'Names'], ['logos', 'Logos as on home']];
const onHero = (r: DOMRect, vh: number) => r.top > -vh * 0.25 && r.bottom > vh * 0.6;

export default function CdOptions() {
  const [clients, pick] = useOption<Clients>('clients', CLIENTS, 'title');
  const [lines, pickLines] = useOption<Lines>('lines', LINES, 'off');
  return (
    <OptionTabs
      groups={[{
        label: 'Clients', options: CLIENTS, value: clients,
        onChange: (v) => { pick(v as Clients); document.documentElement.dataset.cdClients = v; },
      }, {
        label: 'Margin lines', options: LINES, value: lines,
        onChange: (v) => { pickLines(v as Lines); document.documentElement.dataset.cdLines = v; },
      }]}
      selector=".cd-intro" label="Hero options" when={onHero} />
  );
}
