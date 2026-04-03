export default function ICFGuide() {
  return (
    <div className="border-t border-border">
      {/* Section: The Format */}
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-mono text-accent tracking-wide mb-3">The Format</p>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            The Gauntlet Format
          </h2>
          <p className="text-sm text-[#ccc] leading-relaxed max-w-2xl mb-4">
            One project, four escalating levels. You build something, then extend it until it breaks and you
            have to refactor. CodeSignal calls their version ICF (Industry Coding Framework). The same structure
            shows up on CoderPad, in live interviews, and at onsite rounds. We call it a Gauntlet.
          </p>
          <p className="text-sm text-[#999] leading-relaxed max-w-2xl mb-10">
            The mechanics vary by context: async assessments have timers and automated test gates; live
            interviews are interviewer-paced with no clock; onsites often have no formal testing at all.
            What&apos;s described here is the general pattern. Treat the specifics as guidelines, not rules.
          </p>

          {/* Level breakdown */}
          <div className="space-y-2 mb-10">
            {[
              { level: 'L1', name: 'Basic Implementation', time: '10-15m', desc: 'CRUD operations. Build the core data structure with clean method signatures and edge case handling.' },
              { level: 'L2', name: 'Feature Expansion', time: '20-30m', desc: 'New operations on top of L1. Queries, filtering, aggregations, sorting. Extends the API without touching the core model.' },
              { level: 'L3', name: 'Refactoring', time: '30-60m', desc: 'A cross-cutting concern (timestamps, TTL, transactions) that forces you to restructure L1/L2 code.' },
              { level: 'L4', name: 'Advanced Constraints', time: '30-60m', desc: 'History, rollback, snapshots, or complex state. Leverages good L3 architecture. Most candidates don\'t reach this.' },
            ].map(({ level, name, time, desc, warn }) => (
              <div key={level} className="group flex items-start gap-4 bg-surface-1 border border-border-subtle hover:border-border p-4 transition-colors">
                <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-accent/10 border border-accent/20 text-accent font-mono text-sm font-bold">
                  {level}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-sm font-semibold text-foreground">{name}</span>
                    <span className="text-xs font-mono text-[#aaa]">{time}</span>
                  </div>
                  <p className="text-sm text-[#ccc] leading-relaxed">
                    {desc}
                    {warn && <span className="text-warning font-medium"> {warn}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Scoring */}
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-foreground mb-2">Scoring</h3>
            <p className="text-xs text-[#aaa] mb-4">
              CodeSignal&apos;s ICF uses a 200-600 scale with the following rubric. Other platforms may score differently,
              but the emphasis on refactoring quality and design is consistent across implementations.
            </p>
            <div className="space-y-1.5">
              {[
                { label: 'Correctness & feature completion', weight: '40%', pct: 40 },
                { label: 'Tests & quality', weight: '20%', pct: 20 },
                { label: 'Design & architecture', weight: '15%', pct: 15 },
                { label: 'Refactoring & incremental work', weight: '10%', pct: 10 },
                { label: 'Documentation & clarity', weight: '5%', pct: 5 },
                { label: 'Non-functional / compliance', weight: '5%', pct: 5 },
                { label: 'Time & process signals', weight: '5%', pct: 5 },
              ].map(({ label, weight, pct }) => (
                <div key={label} className="group flex items-center gap-3">
                  <span className="text-sm text-[#ccc] flex-1 min-w-0 truncate">{label}</span>
                  <div className="w-32 h-1.5 bg-surface-2 overflow-hidden shrink-0 hidden sm:block">
                    <div className="h-full bg-accent/40" style={{ width: `${pct * 2.5}%` }} />
                  </div>
                  <span className="font-mono text-xs text-[#aaa] w-8 text-right shrink-0">{weight}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#aaa] mt-4">
              Completing L3 cleanly is generally considered the passing bar. The refactoring grade (10%) disproportionately
              impacts L4 success, since candidates who rewrite at L3 usually can&apos;t reach L4 at all.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Where This Format Appears */}
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-mono text-accent tracking-wide mb-3">Where It Shows Up</p>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Companies and Platforms
          </h2>
          <p className="text-sm text-[#ccc] leading-relaxed max-w-2xl mb-8">
            The 4-level project format appears across more contexts than most candidates expect. CodeSignal&apos;s
            ICF is the most standardized version, but the same structure shows up in live rounds, take-homes,
            and increasingly at onsite interviews in person.
          </p>

          {/* Platform breakdown */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <div className="bg-surface-1 border border-border-subtle p-4">
              <h3 className="text-xs font-mono text-[#aaa] mb-2 uppercase tracking-wide">CodeSignal ICF</h3>
              <p className="text-sm text-[#ccc] leading-relaxed">
                Async, scored 200-600, portable between companies. The most structured version.
              </p>
              <p className="text-xs text-[#aaa] mt-2">Anthropic, Ramp, Coinbase, Dropbox</p>
            </div>
            <div className="bg-surface-1 border border-border-subtle p-4">
              <h3 className="text-xs font-mono text-[#aaa] mb-2 uppercase tracking-wide">CoderPad Live</h3>
              <p className="text-sm text-[#ccc] leading-relaxed">
                Same 4-level structure in live pair programming. Interviewer present, advances you manually.
              </p>
              <p className="text-xs text-[#aaa] mt-2">No automatic test gates</p>
            </div>
            <div className="bg-surface-1 border border-border-subtle p-4">
              <h3 className="text-xs font-mono text-[#aaa] mb-2 uppercase tracking-wide">Take-Home</h3>
              <p className="text-sm text-[#ccc] leading-relaxed">
                Ad-hoc implementations by companies building their own version. Less standardized, same pattern.
              </p>
              <p className="text-xs text-[#aaa] mt-2">Timer and gates vary by company</p>
            </div>
            <div className="bg-surface-1 border border-border-subtle p-4">
              <h3 className="text-xs font-mono text-[#aaa] mb-2 uppercase tracking-wide">Onsite</h3>
              <p className="text-sm text-[#ccc] leading-relaxed">
                In-person, interviewer-led. Increasingly common at final rounds. No timer, interviewer decides pacing.
              </p>
              <p className="text-xs text-[#aaa] mt-2">Format spreading to onsite rounds</p>
            </div>
          </div>

          {/* Confirmed ICF companies */}
          <h3 className="text-sm font-semibold text-foreground mb-3">Confirmed CodeSignal ICF companies</h3>
          <div className="space-y-2 mb-8">
            {[
              {
                company: 'Anthropic',
                domain: 'In-Memory Database, Cloud Storage',
                detail: 'Async take-home, 90 min. Community floor ~550/600.',
              },
              {
                company: 'Ramp',
                domain: 'Banking / Bank Account System',
                detail: 'Async, 2 attempts per 6 months. Very high bar (>560 estimated).',
              },
              {
                company: 'Coinbase',
                domain: 'Banking System',
                detail: 'Async proctored. Cut scores: IC4 ~460, IC5 ~500, IC6 ~550.',
              },
              {
                company: 'Dropbox',
                domain: 'Cloud Storage',
                detail: 'Async, 90 min. Extremely high bar (near-perfect score needed).',
              },
              {
                company: 'Perplexity',
                domain: 'CoderPad (live + onsite)',
                detail: 'Live CoderPad and onsite Gauntlet rounds. Interviewer-paced, not async.',
              },
            ].map(({ company, domain, detail }) => (
              <div key={company} className="bg-surface-1 border border-border-subtle p-4 flex items-start gap-4">
                <span className="text-sm font-semibold text-foreground w-24 shrink-0">{company}</span>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-accent/70 bg-accent/10 border border-accent/15 px-1.5 py-0.5">{domain}</span>
                  <p className="text-xs text-[#ccc] mt-1.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Misconceptions */}
          <div className="bg-surface-1/60 border border-border-subtle p-4 mb-6">
            <h3 className="text-xs font-mono text-[#aaa] mb-2 uppercase tracking-wide">Not the same format</h3>
            <p className="text-sm text-[#ccc] leading-relaxed">
              Not every CodeSignal assessment is this format. <span className="text-foreground font-medium">Databricks</span> uses
              CodeSignal GCA (3-4 separate algorithm problems). <span className="text-foreground font-medium">xAI</span> has
              a custom AI-benchmarked format. Being a CodeSignal customer does not mean they use the 4-level project format.
            </p>
          </div>

          <p className="text-xs text-[#aaa]">
            Company data sourced from candidate reports, Blind, and CodeSignal customer stories.
            Cut scores are community-reported estimates, not official thresholds.
          </p>
        </div>
      </section>

      {/* Section: Strategy & Best Practices */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-0 via-transparent to-surface-0" />

        <div className="relative max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-mono text-accent tracking-wide mb-3">How to Pass</p>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Strategy & Best Practices
          </h2>
          <p className="text-sm text-[#ccc] leading-relaxed max-w-2xl mb-10">
            This format rewards different skills than algorithmic interviews. I went through several of
            these during my job search and tracked what actually moved the needle. The timing and test
            specifics below are based on async assessments like CodeSignal — live interviews are looser,
            but the core strategy holds.
          </p>

          {/* 01: Pacing */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-xs font-mono text-accent">01</span>
              Treat L1 and L2 as setup
            </h3>
            <p className="text-sm text-[#ccc] leading-relaxed">
              Don&apos;t over-engineer L1. A dict is usually fine. What matters at L1 is clean method
              signatures and clear ownership — put operations on the class of the actor that performs them,
              not wherever is convenient. That design discipline pays off at L3.{' '}
              <a href="https://sabareeshiyer.substack.com/p/cracking-the-codesignal-pre-screen"
                target="_blank" rel="noopener noreferrer"
                className="text-accent/80 hover:text-accent underline underline-offset-2 transition-colors">
                This Substack post
              </a>{' '}
              frames the whole test as a state management and extensibility exercise, which I think is the
              right mental model. Move through L2 without gold-plating. The goal is to arrive at L3 with
              time remaining and a codebase you understand.
            </p>
            <p className="text-sm text-[#999] leading-relaxed mt-3">
              On a 90-minute async assessment, rough targets: 10-15 minutes on L1, 20-25 on L2, 40+ for
              L3 and whatever L4 you can reach. You&apos;re{' '}
              <a href="https://www.teamblind.com/post/anthropic-code-signal-ylzu3o5u"
                target="_blank" rel="noopener noreferrer"
                className="text-accent/70 hover:text-accent underline underline-offset-2 transition-colors">
                not expected to finish
              </a>{' '}
              — CodeSignal acknowledges very few candidates complete L4. In a live interview without a
              clock, use levels as your pacing guide instead.
            </p>
          </div>

          {/* 02: L3 */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-xs font-mono text-accent">02</span>
              L3 is the actual interview
            </h3>
            <p className="text-sm text-[#ccc] leading-relaxed">
              L3 introduces a cross-cutting concern — timestamps, TTL, a new transactional dimension — that
              retroactively applies to everything you built in L1 and L2. This isn&apos;t &ldquo;add a new
              method.&rdquo; It&apos;s &ldquo;restructure your data model.&rdquo; The{' '}
              <a href="https://interviewing.io/anthropic-interview-questions"
                target="_blank" rel="noopener noreferrer"
                className="text-accent/80 hover:text-accent underline underline-offset-2 transition-colors">
                interviewing.io Anthropic guide
              </a>{' '}
              frames L3 well: the core skill is reading an ambiguous spec and testing hypotheses against a
              black-box evaluator. Reading carefully before writing anything is usually right.
            </p>
            <p className="text-sm text-[#ccc] leading-relaxed mt-3">
              The trap is bolting on the new requirement instead of refactoring. Copy-pasting L1 methods with
              a timestamp parameter added looks like it works, then falls apart on edge cases — and makes L4
              unreachable. The right move is to extract shared helpers: a single{' '}
              <code className="bg-surface-2 border border-border-subtle px-1 py-0.5 text-xs font-mono text-accent">_get_entry(key, ts)</code>{' '}
              that handles TTL-aware lookup, called by both old and new methods.{' '}
              <a href="https://medium.com/@thosehippos/advice-preparation-for-codesignal-industry-coding-framework-test-reflections-0260f903ce7f"
                target="_blank" rel="noopener noreferrer"
                className="text-accent/80 hover:text-accent underline underline-offset-2 transition-colors">
                This candidate writeup
              </a>{' '}
              covers the refactoring pattern well.
            </p>
            <p className="text-sm text-[#999] leading-relaxed mt-3">
              On CodeSignal, refactoring is{' '}
              <a href="https://discover.codesignal.com/rs/659-AFH-023/images/Industry-Coding-Skills-Evaluation-Framework-CodeSignal-Skills-Evaluation-Lab-Short.pdf"
                target="_blank" rel="noopener noreferrer"
                className="text-accent/70 hover:text-accent underline underline-offset-2 transition-colors">
                explicitly scored (see the technical brief)
              </a>{' '}
              — evaluators see your edit history. The scoring also uses an 80/20 base/bonus split where
              bonus points require perfect module completion. That means polishing a level to 100% is worth
              more than it looks. On other platforms the signal still matters; it just isn&apos;t
              formalized. If L3 didn&apos;t keep a mutation history, L4 rollback is a full rewrite you
              won&apos;t have time for.
            </p>
          </div>

          {/* 03: Tests */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-xs font-mono text-accent">03</span>
              Visible tests are a development tool, not the finish line
            </h3>
            <p className="text-sm text-[#ccc] leading-relaxed">
              On automated assessments, each level has visible tests (you see inputs and expected outputs)
              and hidden ones (pass/fail only on submit). Roughly 25% visible, 75% hidden on CodeSignal.
              Passing all visible tests doesn&apos;t mean you&apos;re done. Hidden tests target edge cases:
              duplicate keys, expired entries, empty result sets, sort tiebreakers, operations applied exactly
              at a boundary timestamp.
            </p>
            <p className="text-sm text-[#999] leading-relaxed mt-3">
              Once visible tests pass, ask what the spec implies that they don&apos;t cover. Submit, see
              what breaks, fix from there. In live interviews there are no hidden tests — the interviewer
              watches you run code and decides when to move on. The edge case thinking still applies; you
              just have to surface it yourself rather than waiting for a test to catch it.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Resources */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-mono text-accent tracking-wide mb-3">Go Deeper</p>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            External Resources
          </h2>
          <p className="text-sm text-[#ccc] leading-relaxed max-w-2xl mb-8">
            Everything I found that&apos;s actually worth reading. Community knowledge on this format is
            scattered — most of it lives in Blind threads and one-off Medium posts from candidates who took
            the test once. The CodeSignal technical brief is the closest thing to an official spec.
          </p>

          {/* Official */}
          <div className="mb-8">
            <h3 className="text-xs font-mono text-[#aaa] mb-4 uppercase tracking-wide">Official Docs</h3>
            <div className="space-y-2">
              <ResourceLink
                title="CodeSignal: Industry Coding Framework"
                url="https://codesignal.com/resource/industry-coding-framework"
                description="Official overview with the canonical example problem and links to the full methodology PDF."
                tag="Official"
              />
              <ResourceLink
                title="CodeSignal ICF Technical Brief (PDF)"
                url="https://discover.codesignal.com/rs/659-AFH-023/images/Industry-Coding-Skills-Evaluation-Framework-CodeSignal-Skills-Evaluation-Lab-Short.pdf"
                description="The actual scoring methodology. Covers the 80/20 base/bonus split, skill proficiency labels, and rubric weights. Most prep guides miss the bonus tier detail."
                tag="PDF"
              />
            </div>
          </div>

          {/* Practice */}
          <div className="mb-8">
            <h3 className="text-xs font-mono text-[#aaa] mb-4 uppercase tracking-wide">Practice Problems</h3>
            <div className="space-y-2">
              <ResourceLink
                title="PaulLockett/CodeSignal_Practice_Industry_Coding_Framework"
                url="https://github.com/PaulLockett/CodeSignal_Practice_Industry_Coding_Framework"
                description="One mock problem (File Storage) from CodeSignal's official PDF. 300+ stars. The original public practice resource for this format."
                tag="GitHub"
              />
              <ResourceLink
                title="domsantini/CodeSignal_IndustryTest"
                url="https://github.com/domsantini/CodeSignal_IndustryTest"
                description="A separate fork with its own problem set and Python test harness. Different problems from PaulLockett's if you need more reps."
                tag="GitHub"
              />
            </div>
          </div>

          {/* Strategy */}
          <div className="mb-8">
            <h3 className="text-xs font-mono text-[#aaa] mb-4 uppercase tracking-wide">Strategy Guides</h3>
            <div className="space-y-2">
              <ResourceLink
                title="Cracking the CodeSignal Pre-Screen — Sabareesh Iyer"
                url="https://sabareeshiyer.substack.com/p/cracking-the-codesignal-pre-screen"
                description="Best framing I've found: treats the test as a state management and extensibility exercise, not speed-coding. Specific advice on actor-based class design and where to put methods."
                tag="Substack"
              />
              <ResourceLink
                title="Advice & Preparation for CodeSignal ICF — Josh Roy"
                url="https://medium.com/@thosehippos/advice-preparation-for-codesignal-industry-coding-framework-test-reflections-0260f903ce7f"
                description="Candidate reflections with actionable prep tips. Good coverage of the L3 refactoring pattern."
                tag="Medium"
              />
              <ResourceLink
                title="Anthropic Interview Process & Questions — interviewing.io"
                url="https://interviewing.io/anthropic-interview-questions"
                description="Covers both the live (60 min) and async (90 min) variants of Anthropic's Gauntlet. Frames the core skill as spec interpretation and hypothesis testing against a black-box evaluator."
                tag="Guide"
              />
              <ResourceLink
                title="InterviewDB: CodeSignal Prep Guide"
                url="https://www.interviewdb.io/guides/codesignal-prep-guide"
                description="Frequency data on problem domains across companies. Banking (91 occurrences), In-memory Database (31), Cloud Storage (25)."
                tag="Data"
              />
            </div>
          </div>

          {/* Candidate experiences */}
          <div className="mb-8">
            <h3 className="text-xs font-mono text-[#aaa] mb-4 uppercase tracking-wide">Candidate Experiences</h3>
            <div className="space-y-2">
              <ResourceLink
                title="My 2025 Anthropic SWE Interview Experience — Anqi Silvia"
                url="https://medium.com/@anqi.silvia/my-2025-anthropic-software-engineer-interview-experience-9fc15cd81a99"
                description="Full L1–L4 walkthrough of the in-memory database problem. One of the most detailed firsthand accounts available."
                tag="Medium"
              />
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-xs font-mono text-[#aaa] mb-4 uppercase tracking-wide">Community Discussion</h3>
            <div className="space-y-2">
              <ResourceLink
                title="What kind of prep for CodeSignal ICF?"
                url="https://www.teamblind.com/post/what-kind-of-prep-for-codesignal-industry-coding-framework-1hhe30uo"
                description="Broad prep strategy thread. Good mix of candidate approaches and score reports."
                tag="Blind"
              />
              <ResourceLink
                title="Anthropic CodeSignal — score expectations and retakes"
                url="https://www.teamblind.com/post/YgN1SgoH"
                description="Covers Anthropic-specific score thresholds, retake policy, and the relationship between score and hiring decisions. Includes a 1000/1000 raw score rejection report."
                tag="Blind"
              />
              <ResourceLink
                title="Coinbase ICF — IC4/IC5/IC6 cutoff data"
                url="https://www.teamblind.com/post/coinbase-industry-coding-assessment-ic6-cutoff-insights-mfyenzwa"
                description="Community-sourced score cutoff data for Coinbase at different levels. IC5 ~530–550/600 reported as competitive."
                tag="Blind"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResourceLink({ title, url, description, tag }: {
  title: string;
  url: string;
  description: string;
  tag: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-surface-1 border border-border-subtle hover:border-border p-4 transition-all hover:translate-y-[-1px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
            {title}
          </h4>
          <p className="text-xs text-[#ccc] mt-1 leading-relaxed">{description}</p>
        </div>
        <span className="text-[10px] font-mono text-accent/70 bg-accent/10 border border-accent/15 px-2 py-0.5 shrink-0">{tag}</span>
      </div>
      <div className="text-[11px] font-mono text-[#aaa] mt-2 truncate group-hover:text-[#ccc] transition-colors">{url}</div>
    </a>
  );
}
