import type { Metadata } from 'next';
import EdRole, { EdChecklist, EdPart, EdStep, Ref } from '../../../components/careers/EdRole';
import { SITE_URL } from '../../../components/seo';

/* /careers/creative-director (2026-11-27; the long read moved here from /exp): the Creative Director role as a long read (EdRole). The text of
   /careers/creative-director word for word; a few of its own lines set large as beats, the attention
   paragraph set apart between rules, the questions, the storyboard's steps and the shot details as
   lists (their sentences unchanged), "the type of person" as a checklist. Images hidden, as on the live
   page. The cover: an orchid sprig blooming (Pexels 29999015, baked by scripts/bake-careers-branch.py). */

const DESCRIPTION = 'As a Creative Director at Identity Labs, you will identify the aha moment that sets each product apart, then work backwards to find the most creative, undeniable way to show it to 10 million people.';

export const metadata: Metadata = {
  title: 'Creative Director | Careers | Identity Labs',
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/careers/creative-director` },
  openGraph: { title: 'Creative Director | Identity Labs', description: DESCRIPTION, url: '/careers/creative-director' },
};

export default function CreativeDirectorPage() {
  return (
    <EdRole title="Creative Director" cover={{ src: '/assets/careers/clips/branch.webm?v=2', focus: [0.55, 0.5], tone: [0, 0.4] }}>
          {/* ── 01 */}
          <EdPart n={1} id="the-role" title="The role">

            <p>If you’ve watched the <Ref href="https://www.youtube.com/watch?v=MnrJzXM7a6o&t=207s">2007 iPhone keynote</Ref>, you probably remember Steve Jobs announcing 3 products (an iPod, a phone and an internet communicator) and repeating them until the audience realised he was talking about one device, the iphone.</p>
            <p>Or the <Ref href="https://www.youtube.com/watch?v=ffnspcID1lQ">MacBook Air launch</Ref> a year later, where he pulled the laptop out of a manila office envelope and left the audience speechless.</p>
            <p className="ed-beat">Why do people still remember these moments almost 20 years later?</p>
            <p>Ask anyone who watched them and they’ll remember these exact moments. The envelope. “Are you getting it?”</p>
            <p className="ed-beat ed-beat-sm">These weren’t moments born out of fluke.</p>
            <p>They took a team that understood the product in depth, narrow down on the one feature that truly made it exceptional, and then worked backwards from that to figure out the best way to show it.</p>
            <p>Every great product has a feature that sets it apart from everything else out there, the kind that makes people stop in their tracks.</p>
            <p className="ed-aha">We call it<br /> <strong>the aha moment.</strong></p>
            <p>Take the MacBook Air.</p>
            <ol className="ed-steps">
              <li>Somebody at Apple sat with the laptop long enough and asked: of everything this does, what is the one thing that is truly aha? What makes it different from every other laptop in the world? It wasn’t the processor or the battery, even though both were incredible features at the time. It was how thin it was. Impossibly thin. 0.76 inches at its thickest point. That was the aha moment.</li>
              <li>Once you know the aha moment is thinness, the question changes. How do you make millions of people <em>feel</em> how thin 0.76 inches is? A side-profile shot could work, but doesn’t reallyyyy do it. Definitely not a number on a slide. But an office envelope could. Everyone has held one. Everyone knows how flat it is. Pulling a laptop out of an envelope makes the audience understand something no spec sheet could ever tell them: this laptop is SO thin it can fit in an envelope.</li>
            </ol>
            <p>Same with the iPhone. The aha moment was that 3 devices people carried separately were now one. Repeating the 3 products until the audience made the connection themselves is what made it land.</p>
            <p>The problem is that building a great product and knowing what makes it interesting are two very different faculties. Most founders have the first, but not the second. They don’t have the eye or the attention to detail to isolate what is interesting enough to steal a million people’s attention. They’ll show you 14 features, and the aha moment is buried somewhere in the 9th, or in an offhand comment a customer made on a sales call 6 months ago.</p>

            {/* the attention paragraph, set apart across the page between rules, on white */}
            <div className="ed-band">
              <div className="ed-band-in">
                <p>And this combination of isolating what is interesting and then figuring out the most interesting way to show it matters more today than it ever has.</p>
                <p>4B+ people spend more than 4 hours a day on their phones. Your launch video is competing with Elon’s latest post, a cat video, and a war. We’re in an age where attention is the new currency. <span className="ed-band-big">99% of content disappears into the void.</span></p>
              </div>
            </div>

            <p>As a Creative Director at Identity labs, you will hone your faculty for isolating what is interesting in a product to create the 1% that doesn’t. Your job is to do what Apple’s launch team does, for the best tech products in the world. Identify the aha moment that sets each product apart from everything else, then work backwards to find the most creative, undeniable way to show it to 10 million people in a way that sticks.</p>
            <p className="ed-lede">If a film director and a product marketer had a child, you’d probably get a Creative Director at Identity Labs: someone who can sit across from a founder, understand their product better than their own team, find the aha moment, turn it into a frame-by-frame storyboard, and direct a team of editors, motion designers and creators to bring it to life.</p>
            <p className="ed-close">You will be the person standing between a generational product and the attention it deserves.</p>
          </EdPart>

          {/* ── 02 */}
          <EdPart n={2} id="what-this-looks-like" title="What this looks like">

            <EdStep n={1} id="go-deep" title="Go deep into the best AI products with the founders of the fastest-growing companies in the world">
              <p>Every launch starts with you going deep into the product. One day, you could be on a call with Anton Osika, founder of Lovable ($13B), as he walks you through his vision for it: how you describe an app in plain English and Lovable builds it, and which features are his personal favourites. You get free credits to build an app yourself to understand the tool better, and you sit in on their sales calls to see which features excite customers most.</p>
              <p>You’ll work directly with the best tech founders in the world, and learn about the most important AI products being built today, before anyone else sees them.</p>
            </EdStep>

            <EdStep n={2} id="isolating" title="Isolating the aha moments">
              <p>Once you understand the product inside out, your job is to then identify its aha moment, the feature that sets it apart from everything else out there. This starts with asking the right questions.</p>
              <ul className="ed-qs">
                <li>What do customers say the first time they try it?</li>
                <li>Which feature do you always demo first, and why?</li>
                <li>What’s the one thing users keep screenshotting and sending to their friends?</li>
              </ul>
              <p>Every answer is a potential aha moment.</p>
              <p>Say you’re launching a new version of Wispr Flow. On your call, Tanay (Wispr Flow’s founder) talks for 40 minutes about accuracy, latency and integrations. But in the 3rd sales call you watch, a prospect dictates a rambling message full of “ums” and half-sentences, and Wispr Flow types out a clean, perfectly punctuated paragraph. The prospect goes, <span className="ed-quote">“wait, how did it know what I meant?”</span> That’s the aha moment.</p>
              <p>Or say you’re launching Akai, Deel’s new workflow automation tool. It can do dozens of things, and the team is excited about all of them. But one feature no other automation tool has: you don’t build the workflow at all. You record your screen while doing the task once, and Akai maps every step and builds the entire workflow for you in under 2 minutes.</p>
            </EdStep>

            <EdStep n={3} id="presenting" title="Figuring out the best way to present the aha moment so it lands">
              <p>Once you’ve found the aha moment, you ask the macbook envelope question: what’s the most creative way to make people truly feel it? What medium/actor/set/build up/animation is required to make it land? And what does the viewer need to understand about the product, or the problem it solves, right before the aha moment so that it sticks?”</p>
              <p>Take Akai. The aha moment is that you record yourself doing a task once, and Akai builds the entire workflow for you. But nobody scrolling past cares about workflow automation yet, so you work backwards.</p>
              <ol className="ed-board">
                <li>Give people a reason to stop and watch on. For eg in the Akai storyboard, the video starts with the director asking Alex (founder of Deel), “Shouldn’t you say we <em>raised</em> five hundred million dollars $140M here?” Alex replies, “No, we made $140M in ARR in 90 days, without increasing team size. Now the viewer has to know how. How could Deel possibly add $140M in ARR in 90 days? That’s an answer worth sticking around for.</li>
                <li>Then you make the viewer understand Akai by taking a use case general enough that everyone relates to, but interesting enough to showcase akai’s aha features. You pick a task every salesperson hates: manually entering a prospect’s details into Salesforce 10 times a day.</li>
                <li>Then the aha moment lands. Akai picks up the voice and every server request, and builds the step-by-step process and all the connectors on its own. It even works out things without being told.</li>
              </ol>
              <p>You write all of this out as a storyboard, line by line: the voiceover, what’s on screen at every moment, and notes for the editors.</p>
            </EdStep>

            <EdStep n={4} id="directing" title="Directing the launch, second by second. Making sure your vision gets translated in the final launch video.">
              <p>Once the storyboard is locked, your job is to make sure your vision gets translated in the final video. You’ll work with our in-house team of video editors, motion designers and sound directors (and film crews in SF or NYC when a launch needs it) to bring every frame to life.</p>
              <p>Here’s what the second-by-second storyboard looked like for our Wispr Flow launch:</p>
              <p>This means being ultra-OCD about the details.</p>
              <ol className="ed-shots">
                <li>The camera angle has to make the Porsche feel like the prize.</li>
                <li>The backdrop has to be clean enough that nothing pulls attention from the product.</li>
                <li>The “changed 8pm → 9pm → 10pm” callout has to pop up the moment the text corrects itself, not half a second later.</li>
                <li>The split screen has to cut to the rapper’s face at the exact moment he realises Flow got every word.</li>
              </ol>
            </EdStep>

            <EdStep n={5} id="assets" title="Building the assets that 1000+ creators will post to amplify the launch">
              <p>A launch video doesn’t go viral alone. On launch day, 1000+ creators on X and LinkedIn post about the launch at the same time, and every one of them needs something worth posting.</p>
              <p>For each aha moment in the launch video, you’ll extrapolate it into multiple shorter assets: GIFs, static images, short clips and screenshots. Each one is built to work on its own, even for someone who never sees the full video</p>
              <p>Examples of assets we think are exemplar:</p>
              <ol className="ed-ex">
                <li><span>1.</span> Dyson Oral Care</li>
                <li><span>2.</span> Remarkable Paper</li>
              </ol>
            </EdStep>
          </EdPart>

          {/* ── 03 */}
          <EdPart n={3} id="the-person" title="The type of person we’re looking for">
            <EdChecklist
              note="(You don’t have to check all of these, but these are instructional. Usually representative of a certain type of person we are looking for)"
              items={[
                'You have made 3+ videos with 1M views and understand the art and science behind them.',
                'You have directed videos yourself, whether YouTube videos, short films or ads. Bonus points if you know production too.',
                'You can tell when a cut is off by a single frame, and it bothers you.',
                'You have strong opinions about typography, sound design, pacing and music choice.',
                'You get excited about AI products and can’t help going deep into how they work.',
                'You use AI video tools like Runway, Veo, Kling or Midjourney',
                'Twitter native',
                'You can find a guy for anything. A Porsche by Friday? You know someone',
                'You can walk into a room with a founder and get them excited about your vision for their launch.',
              ]}
            />
          </EdPart>
    </EdRole>
  );
}
