import type { Metadata } from 'next';
import EdRole, { EdChecklist, EdFig, EdPart, EdStep } from '../../../components/careers/EdRole';
import { SITE_URL } from '../../../components/seo';

/* /careers/thinker-writer (2026-11-27; the long read moved here from /exp): the Thinker-Writer role as a long read (EdRole), as /careers/creative-director.
   The text from the Notion posting, from "The Role" on, with its typos fixed (2026-11-28): its bold set as the highlights, its opening line
   as a beat, the four parts of "What this looks like" as unnumbered steps (bullets in the posting). The
   posting's creative brief where it places it (EdFig), the banner left out.
   The cover: a row of long-stemmed roses (Pexels 12142444, baked by scripts/bake-careers-wide.py). */

const DESCRIPTION = 'Your job will be to hone your faculty for perceiving virality and art to mine and synthesize pattern-interrupting ideas, giving them the form required to shape discourse forever.';

export const metadata: Metadata = {
  title: 'Thinker-Writer | Careers | Identity Labs',
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/careers/thinker-writer` },
  openGraph: { title: 'Thinker-Writer | Identity Labs', description: DESCRIPTION, url: '/careers/thinker-writer' },
};

export default function ThinkerWriterPage() {
  return (
    <EdRole title="Thinker-Writer" cover={{ src: '/assets/careers/clips/roses.webm?v=1', focus: [0.47, 0.28], tone: [0, 0.4] }}>
      <EdPart n={1} id="the-role" title="The Role">
        <p className="ed-beat">There is this beautiful concept called <strong>“The Palette of Being”.</strong></p>
        <p>If you could look into the mind of a concert pianist, you would see how much of their mind is actually dedicated to the instrument, represented as different neural networks in the brain - the ability to coordinate 10 fingers, to work the pedal, the understanding of music theory. It’s worth mentioning that this pattern and structure was not present in the brains of people a couple of hundred years ago because the piano itself was not invented until the 1700s. In other words, the skill of the piano was not a “thinkable thought” until very recently. It was not a colour available in the ‘palette of being’ you could paint with.</p>
        <p>Even the invention of the piano itself was not an independent thought. It required depth of mechanical engineering, a history of stringed instruments, and developing numerous other patterns of thought that led to the <em>possibility</em> of its invention and ONLY then, the <em>possibility</em> of the mastery of its play.</p>
        <p>We are born into this life, having at our disposal the experiences or the palette of “colours” that humanity has collected thus far to paint with. But every so often, we’re presented with the opportunity to invent a new colour. A colour that might come from an invention like self-driving cars for example, or <strong>a new idea that changes the way people think about the world around them.</strong> An idea with the potential of shaping an entire era.</p>
        <p className="ed-lede">As a Thinker-Writer at Identity Labs, your job will be to coin the ideas that add new colours to “the palette of being” of the 21st century.</p>
        <p>All our clients have unknowingly built their own stack of paradigm-shifting ideas over the course of building billion-dollar businesses. Ideas that span tech, culture, business, philosophy, and what have you. Ideas born from first-hand, experiential learning.</p>
        <p>But for every one Paul Graham that has the writing skill to put their ideas to paper, there are a hundred walking around that are every bit as insightful but lack the skill, patience or distribution to give their ideas the correct form. These people are our clients. Alex Bouazis for example, grew Deel to 1B ARR faster than Stripe and Palantir. And all from his living room! How could he have possibly done that? A question like this deserves an answer.</p>
        <p className="ed-lede">Your job will be to hone your faculty for perceiving virality and art to mine and synthesize these pattern-interrupting ideas, giving them the form required to shape discourse forever.</p>
      </EdPart>

      <EdPart n={2} id="what-this-looks-like" title="What this looks like">
        <EdStep id="interviewer" title="Be a Podcast Interviewer by engaging some of the best minds in Silicon Valley in the language of thought.">
          <p>One day, you could be talking to Bryan Johnson about how the real essence of Blueprint as a philosophy is lost on people because they don’t believe the diet plan. He tells you that understanding Blueprint is downstream of understanding Zeroth Principles and the Autonomous Self. You add to his point by saying you think Blueprint is civilisation&apos;s second best attempt (after religion) at goal aligning with the self. How religion&apos;s goal (salvation) is actually not as relatable as Blueprint&apos;s goal (prep for zeroth future).</p>
          <p>The next day, you could be interviewing Marc Andreessen about his piece ‘The only thing that matters’, listening to him talk about how market is the most important factor in a startup’s success or failure. You challenge his idea by posing that market is a lagging indicator of cultural mood. That culture is the only layer that truly matters. How everything else (tech, markets, relationships, politics) is just emergent behaviour stacked on top of culture. You both come out of the dialogue with a more robust idea of what the only thing that matters is.</p>
          <p>You will interview and lead live brainstorming calls with the likes of Anish Acharya (Partner at a16z), Grant Lee (Founder of Gamma), Bryan Johnson (Former CEO Venmo, now Blueprint). Your role will be that of a thought partner - challenging, provoking, and mining for pattern-breaking insights with the creative instinct to recognize what could become this century&apos;s top 100 ideas.</p>
        </EdStep>

        <EdStep id="synthesise" title="Synthesise and blend your own working theories with these ideas to give them shape and form">
          <p>Say you’re writing a hiring related post for Grant on how he grew Gamma to $50M ARR in &lt;6 months with a team of 28 people. From your conversations with him you isolate his key hiring secret: only hire people who can independently build $10M businesses. You connect this to that one Steve Jobs line about how 1 great hire equals 100 mediocre ones. You then remember a recent conversation you had with a friend where you discussed “distance travelled” as a way of judging someone’s character. You recall discussing how someone’s 80 yards of progress from the -20 yard line speaks more about the value they can add to an organisation than 80 yards from the 10. You layer Grant’s hiring heuristic with the Steve Jobs quote and “distance travelled” as a measure of character. What you now have is a more holistic hiring post that will likely change the way people view hiring as a whole.</p>
          <p>Like this you will mine and synthesise clients’ ideas with your own working theories, firm them up with cross-disciplinary references and give them the shape and form that will reach millions using your virality and artistic lenses.</p>
        </EdStep>

        <EdStep id="briefs" title="Write detailed creative briefs that empower writers to bring your ideas to life">
          <p>You wake up one morning with an idea to write a thread on how polymaths make the best entrepreneurs for a client, Kennan (Founder of Icon).</p>
          <p>Your creative brief is a link to 2 inspirational twitter posts, a chapter from the book Polymaths by Peter Hollins, a quote, link to a research paper, a graph, a working theory. Something like this:</p>
          <EdFig src="/assets/careers/tw/creative-brief.webp" full="/assets/careers/tw/creative-brief-full.webp" w={2048} h={1237} alt="A creative brief" />
          <p>You will distill complex ideas into clear blueprints with complete context, hook guidelines, narrative flow, references, and visual elements, enabling writers to execute your vision in the form of viral threads for clients.</p>
        </EdStep>

        <EdStep id="review" title="Review and provide periodic feedback to ensure thread quality">
          <p>You’ll ensure each piece effectively translates your vision clearly and meets the standard of pattern-breaking content that defines the brand, transforming good threads into breakthrough viral content that will cut through the noise.</p>
        </EdStep>
      </EdPart>

      <EdPart n={3} id="the-person" title="The Type of Person Who Fits Our Culture">
        <EdChecklist
          note="(You don’t have to check all of these, but these are instructional. Usually representative of a certain type of person we are looking for)"
          items={[
            'You have written 5+ threads with 1M views on Twitter and understand the art and science behind it.',
            'Over the years, you’ve unknowingly created your own collection of working theories (original frameworks for understanding the world), coined from all you’ve read, observed, and experienced.',
            'You’re energized by intellectual sparring, knowing when to challenge ideas and when to probe deeper.',
            'You enjoy podcasts and can someday see yourself hosting one.',
            'You spend a lot of time on Twitter.',
            'You are the most articulate person you know.',
            'You frequently get described as the most well-read person in your group.',
            'You think LinkedIn is cringe.',
            'You’re interested in startup culture, entrepreneurship, and have read extensively about it.',
          ]}
        />
      </EdPart>
    </EdRole>
  );
}
