import type { Metadata } from 'next';
import EdRole, { EdChecklist, EdFig, EdPart, EdStep, Ref } from '../../../components/careers/EdRole';
import { SITE_URL } from '../../../components/seo';

/* /careers/head-of-growth (2026-11-27; the long read moved here from /exp): the Head of Growth role as a long read (EdRole), as /careers/creative-director.
   The text word for word from the Notion posting, from "The Role" on: a few of its own lines set apart
   (beats, the September band, the lede), its lists as lists, its bold lead-ins darker. The posting's
   images (a typical launch, a typical day, the 220K outreach) where it places them (EdFig), the banner left out;
   "Here's what a typical day looks like:" (beside the third step's list in Notion) after that list.
   The cover: white hydrangeas (Pexels 38695092, baked by scripts/bake-careers-wide.py). */

const DESCRIPTION = 'As a Head of Growth at Identity Labs, you’ll own the outcome of every launch you run for AI products of Silicon Valley’s fastest-growing companies.';

export const metadata: Metadata = {
  title: 'Head of Growth | Careers | Identity Labs',
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/careers/head-of-growth` },
  openGraph: { title: 'Head of Growth | Identity Labs', description: DESCRIPTION, url: '/careers/head-of-growth' },
};

const B = ({ children }: { children: string }) => <span className="ed-lead">{children}</span>;

export default function HeadOfGrowthPage() {
  return (
    <EdRole title="Head of Growth" cover={{ src: '/assets/careers/clips/hydrangea.webm?v=2', focus: [0.5, 0.5], tone: [0, 0.4] }}>
      <EdPart n={1} id="the-role" title="The Role">
        <p>When Apple launches an iPhone, the keynote streams live to the world. Five hero films premiere within the same hour, each costing $2–3M to produce. 10,000 creators drop reviews and reactions in the same news cycle. Ads and billboards go up in every country. It&apos;s the coordinated work of a thousand designers, filmmakers, ad teams, sales orchestrators and retail trainers.</p>
        <p>None of it works without the infrastructure underneath: the creative faculty to produce tasteful films, the creator network, the production studios, the ad machine and the retail stores, built quietly over decades.</p>

        <div className="ed-band">
          <div className="ed-band-in">
            <p>The result of one launch cycle is roughly 20% of the existing customer base upgrades. <span className="ed-band-big">Tens of billions of dollars. Every September.</span></p>
          </div>
        </div>

        <p>At Identity Labs, we&apos;ve built the distribution infrastructure to run Apple-like launches for the fastest-growing tech companies in the world. Every one of these launches needs one person who owns the outcome and drives it end to end. That person is the Head of Growth.</p>
        <p>As a Head of Growth at Identity Labs, you&apos;ll own the outcome of every launch you run for AI products of Silicon Valley&apos;s fastest-growing companies, whether that&apos;s $5M in sales, 1,000 SQOs or 10M views. You&apos;ll set the strategy and lead every team behind it: influencer sourcing and coordination, the creative direction of the launch video and assets, Meta, X and LinkedIn ads, and production. You&apos;ll manage the budget, work directly with the founder, and make the creative calls needed to hit the number.</p>
        <p>You will be forward-deployed into these companies, advising founders directly and orchestrating company-defining launches. You&apos;ll lead a team and run budgets north of a million dollars. Founders trust us to launch the product their entire company spent the last six months building, and the trajectory of their company depends on what you ship.</p>
        <p className="ed-lede">If a founder, a film producer and a growth marketer had a child, you&apos;d probably get a Head of Growth at Identity Labs: someone who thinks in outcomes, can direct a team of creatives, and will do whatever it takes to win.</p>
        <p className="ed-beat">2 years in this role will give you what takes most people 20.</p>
        <p>By the time you leave, you will have orchestrated 20+ complex launches and driven tens of millions in directly attributable revenue. You&apos;ll have a portfolio of launches for some of the most exciting companies on earth, direct relationships with the founders, investors and operators behind each one, and an undeniable skill: getting 10M views for any product. Any company will happily make you their Head of Product Marketing if you can guarantee virality.</p>
      </EdPart>

      <EdPart n={2} id="what-this-looks-like" title="What this looks like">
        <p className="ed-beat ed-beat-sm">Founder-level ownership to run launches end-to-end</p>

        <EdStep n={1} id="align" title="Align with the founder on the launch outcome and set the strategy and plan to achieve it">
          <p>Say you’re launching a new version of Lovable. You get on a call with the founder, Anton, and align on 1,000 new paying customers in 30 days being the target. You even fly down to SF if required.</p>
          <p>Then you work backwards. 1,000 paying customers means roughly 5M views from people who want to build software but can’t code, and a reason for them to sign up today rather than next month. To get there, you’d need to:</p>
          <ul className="ed-qs">
            <li>Align with Anton on a killer launch offer that will drive sales, e.g. a free month of Pro for the first 1,000 sign-ups.</li>
            <li>Lock the storyboard for the main launch video 3 weeks out, so production has time to get every frame right.</li>
            <li>Source and brief 150 creators 2 weeks before launch: no-code builders and solo founders.</li>
            <li>Plan for 200 assets made by Lovable’s own employees, each one building onto the key features showcased in the main launch video.</li>
          </ul>
          <p>You’ll sit across from the founders of some of the fastest-growing companies in Silicon Valley, set their product marketing goals with them, and get them aligned on the strategy to hit them.</p>
          <p>This is what a typical launch looks like:</p>
          <EdFig src="/assets/careers/hog/typical-launch.webp" w={1838} h={1318} alt="A typical launch" />
        </EdStep>

        <EdStep n={2} id="founder-variables" title="Determine variables only controlled by the founder for every launch and make trajectory changing decisions for the whole company">
          <p>For Icon’s launch, we told them to change their price from $29 to $999. It was an AI ad platform, and people pay thousands of dollars for ads every month. We knew you could charge for the value the tool is creating instead of charging the standard base SaaS fee. They reached $4M ARR in 30 days.</p>
          <p>Matic Robots wanted to announce voice as a new feature. We convinced them to relaunch the entire product with voice at its centre instead, and got 300 of their own customers to post about it on launch day. Matic did $4M in sales the next month, and $3M the month after.</p>
          <p className="ed-beat ed-beat-sm">You’ll make founder-level decisions that change the trajectory of the companies you do launches for.</p>
        </EdStep>

        <EdStep n={3} id="teams" title="Hire and lead every team that makes the launch work">
          <p>You put together your own launch team, hiring whoever the launch needs externally: a film crew in SF, motion designers, or the right creators for the type of launch. Then you lead every team, getting into the details of their work to make sure it serves the launch goal, happens on time, and carries the vision for the launch.</p>
          <ul className="ed-qs">
            <li><B>Run working sessions with the creative director to isolate the features that go into the main launch video</B>. Use your sense for virality and business to know which creative decisions will get the launch to millions of views and 1,000 customers, and which won’t.</li>
            <li><B>Work with the asset team to extrapolate the aha features from the launch video into 100+ unique assets</B>, each one geared to sell.</li>
            <li><B>Mobilise 500 employee creators and 1,000+ external creators.</B> Make sure every post is built to go viral and sell, and that every creator is sourced, onboarded, paid, reviewed and supplied with assets before launch day.</li>
            <li><B>Work with the tech team to build the dashboards and reporting tools that track directly attributable SQOs</B>, the important people who engaged, and how every part of the launch is performing. You’ll see what’s working and what isn’t, and fix it mid-launch.</li>
            <li><B>Work with the ads team to set the strategy</B>, and change demographics, creatives or use cases mid-launch if something isn’t working.</li>
          </ul>
          <p>Here’s what a typical day looks like:</p>
          <EdFig src="/assets/careers/hog/typical-day.webp" full="/assets/careers/hog/typical-day-full.webp" w={1400} h={1723} alt="A typical day" />
          <p className="ed-beat ed-beat-sm">You design and run the machine that delivers the outcome.</p>
        </EdStep>

        <EdStep n={4} id="rethink" title="Keep rethinking and reassessing the plan, and make the changes necessary to achieve the goal within the timelines and budget">
          <ol className="ed-shots">
            <li>You’re in the dashboard figuring out why “we almost shut down” outperformed the funding announcement 4:1, and rebuilding the rest of the campaign around it.</li>
            <li>You’re arguing the demo link needs to be in the first tweet, not the second. The second performs 400% worse.</li>
            <li>You’re in the Meta Ads Library pulling every ad the client has ever run, cross-referencing them with their top organic posts to find which narratives actually converted, and turning those into 40 new assets.</li>
            <li>You’re reviewing 30 assets two days before launch and killing anything generic before it ships.</li>
          </ol>
          <p>The plan you made 3 weeks out is a starting point. You keep changing it, across every team, and do whatever is necessary to ensure the goal is hit.</p>
        </EdStep>
      </EdPart>

      <EdPart n={3} id="the-person" title="The type of person we’re looking for">
        <EdChecklist
          note="(You don’t have to check all, these are instructional. Usually representative of a certain type of person we are looking for)"
          items={[
            <><Ref href="https://www.youtube.com/watch?v=hT_MAAwFLIc&t=1799s">Self-guided missile</Ref>: can set the goal and set up the system required to achieve it.</>,
            'You have scaled a product/service/program from 0 to 1,000 users and know exactly what got it there.',
            <>You’re high agency. For example, you think reaching out to 220K influencers is normal.<EdFig src="/assets/careers/hog/outreach-220k.webp" w={1520} h={332} alt="Outreach to 220K influencers" /></>,
            'You’re a jack-of-all-trades generalist.',
            'You have written 5+ posts with 1M views on Twitter and LinkedIn and understand the art and science behind it (Instant hire if you do, but we’ll help train you even if you don’t know how this works)',
            'You think from first principles.',
            'You’re a Twitter nerd and you spend >2 hours/day on Twitter.',
            'You follow AI, Tech, Venture Capital, Startups and understand our corner of Twitter.',
            'High IQ, high EQ.',
          ]}
        />
      </EdPart>
    </EdRole>
  );
}
