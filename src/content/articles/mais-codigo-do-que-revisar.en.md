_When planning, building and documenting become machine steps, one bottleneck is left — and it is human_

## 🎯 The pain nobody puts in the success story

Picture the scene: Thursday, 4:40pm.

A merge request opens with **118 changed files**. The plan for the change was reviewed before a single line existed. The tests are green. The documentation for what was delivered is already written. From a process point of view, everything worked exactly as it should.

And then comes the question nobody asks out loud at standup:

**Who reviews this?**

The honest answer, most of the time, is: nobody. Not out of negligence — out of arithmetic. There are too many MRs, with too many changes, arriving too fast. Someone opens it, scrolls the file list, looks at two or three that seem critical, and approves.

And there is a worse detail. In the previous release MR, there were **617 files**. The review interface showed 170. The other 440 came back with an empty diff — collapsed by a size limit — and **nothing on screen warned that content was hidden**. Someone reviewed that, approved it and merged with the legitimate feeling of having seen the MR.

They did not. They saw 28%.

That is the real state of many teams that adopted an agentic development cycle in 2026. The promise was kept: writing became cheap. What nobody put on the slide is that **understanding what was written still costs exactly what it cost before.**

It is like replacing a dirt road with a six-lane highway and keeping the same toll booth, with the same attendant, taking cash.

## 🏛️ The origin: we automated everything except the part that judges

It is worth looking back to understand why the bottleneck settled right there.

Over the last twenty years, software engineering automated practically every step between idea and production. Compilation became a pipeline. Testing became a gate. Deploy became a button, then a merge, then nothing — it happens by itself. Rollback became automatic. Infrastructure became code. Observability started warning before the user complained.

One step was never automated: **the one that passes judgement.**

Code review remained a person reading what another person wrote and deciding whether it is acceptable. And that is neither a historical accident nor industry laziness — it is because reviewing demands the two things machines did not have: the context of what the team agreed on, and the willingness to back an opinion in front of a colleague.

For a long time that worked, because the volume was human on both sides. One person wrote, one person read. The production rate and the review rate were the same thing.

There is an old and much-quoted finding about review effectiveness: the ability to find defects collapses once a review goes beyond a few hundred lines at a time. It is not a law of physics, but anyone who has reviewed a large MR knows it is true — attention runs out before the files do.

Now put into that equation a cycle where production stopped being human. **The top side accelerated. The bottom side is still a person, with the same finite attention, on the same Thursday afternoon.**

The bottleneck did not appear. It was always there — it was just hidden behind other, larger bottlenecks. Automation removed all the others and left that one alone, in the middle of the room, lit up.

## 🧩 What the agentic cycle actually delivered

Before criticizing, it is only fair to recognize what genuinely improved, because it was not little.

The flow we follow has five steps, and none of them is "ask the agent to do it":

1. **Refine the requirement.** The ticket is read and challenged before it becomes anything — ambiguity, gaps and vague acceptance criteria are raised at the business layer, not at the code layer.
2. **Plan before implementing.** The change produces reviewable artifacts: the intent, the architecture decisions where there is real complexity, the affected repositories, the contracts between them, and a task list per repository.
3. **Implement** following that plan, in test cycles, with the house engineering standards applied per repository type.
4. **Audit the implementation against the plan** — automatically, before any human looks.
5. **Sync the documentation** after the merge, deriving the description of the behaviour **from the real diff**, not from what the plan said would happen.

Three things here are genuinely good, and I would defend each one:

**The plan exists before the code, and it is reviewable.** Discussing architecture on top of a two-page document costs minutes. Discussing the same thing on top of 118 files costs a sprint. Moving the discussion earlier is the most obvious gain and the most underestimated.

**Standards apply themselves.** Before, "apply the engineering standards" depended on someone remembering. Now they enter the plan automatically according to repository type — API, aggregation layer, web, mobile. That is the idea of [standards with teeth](/artigos/frontend-como-plataforma) working in practice: the rule does not depend on individual discipline, it is built into the path.

**The documentation is derived from reality, not from intent.** That is the smartest detail in the whole process. The description of the delivered behaviour comes from the diff after the merge — so a fix made in QA, a last-minute adjustment, something nobody planned, all of it is absorbed. Documentation that describes what you *meant* to do is drift waiting to happen. Documentation derived from what you *did* is born honest.

So yes: the process works. The problem is not the process.

## ⚖️ The maths that does not add up

Here is the sentence I have not seen in any AI-adoption case study, and it is the most honest thing I have to say about the last few months:

**Speed went up sometimes. Not always.**

And after a while taking hits, the pattern of *when* it goes up became clear. It has nothing to do with the model, the prompt or the quality of the plan.

> **The gain of an agentic cycle is proportional to the strength of your automatic verifier.**

Where there is a function that says "this is correct" without depending on a pair of eyes, the machine produces and the machine checks, and the gain is real and large. Where that function does not exist, volume does not save work — it **transfers** work. From writing to checking.

And checking is slower than writing. It always was.

In the backend, the verifier is strong: a test that runs, an API contract that validates itself, coverage that can be measured, a type that will not compile if it is wrong. The cycle flies.

In the frontend, the verifier is weak — and that is what almost nobody is writing about.

## 🎨 The frontend is the hard case (and it is not for lack of context)

Everybody's first hypothesis is that the frontend does badly because the agent lacks context. We tested that, and it is not it.

Today the design arrives alongside: we export the design in a readable format straight from the design tool, and it enters the change together with the reference to our design system. The agent knows which token, which component, which spacing. That helped a lot, and it is the right thing to do.

Even so, **the frontend is what comes back for manual adjustment most.**

The reason is that there is no verification function in the frontend for "the screen is right". A green test does not prove visual hierarchy. It does not prove the empty state makes sense. It does not prove long text will not overflow the card. It does not prove you can navigate by keyboard. "Right" in the frontend is perceptual and contextual, and the machine has no way to close that loop on its own.

That alone was already a speed problem. But there is a second one, about quality — and that one is serious.

### The agent cannot say "this does not exist"

The manual adjustment that shows up most is not spacing or colour. It is this:

**the design asks for a component or a variant the design system does not have.**

And faced with that gap, the agent does not stop. It does not open a discussion, does not raise its hand, does not write "this does not exist, someone decide". It does the statistically most reasonable thing: **it improvises.**

**❌ What usually comes back:**

```tsx
// the design asked for a "warning" badge. That variant does not exist in the DS.
// the agent did not stop — it rebuilt it by hand:
<span
  style={{
    backgroundColor: "#FFF4E5",
    color: "#B25E09",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 12,
  }}
>
  Pending
</span>
// it works, it renders, it passes the test.
// and the application's seventh yellow was just born.
```

**✅ What should come back:**

```tsx
// the closest thing that exists, and the gap recorded as a pending decision
<Badge variant="neutral">Pending</Badge>

// + one line in the change report:
// "the design asks for badge/warning; it does not exist in the design system.
//  used neutral. design system decision pending."
```

The difference between the two blocks is not technical. It is that the second one **hands the decision back to whoever has the authority to make it**.

And notice what was lost in the first. It was not context — the agent had the design and had the design system. **What was lost was the conversation.** That "hey, this does not exist, do we create a new component or adapt the design?" was a design system decision being made by people, on purpose, with the consequence owned.

Today that decision is made by inference, alone, in the middle of a 118-file MR nobody is going to read in full.

I have written before about the day we found [six different implementations of the same document validation](/artigos/frontend-como-plataforma) scattered across the micro frontends. That took years to happen. The visual version of it — six yellows, four shadows, three border radii for the same thing — now takes weeks. One improvisation per MR, arriving too fast for anyone to notice.

**A mature design system is not only what it offers. It is also being able to say "I do not have that" out loud.**

## 🔍 The standard you wrote is not the standard you verify

And here we reach the root, which is older than any agent.

In an audit of one of our frontend repositories, the picture was this:

- Extensive and good architecture documentation. A series of numbered architecture decisions, each justifying why that repo deviated from the reference standard at some point. A testing guide. An application composition guide.
- Strict linting. Formatting as an error. Import ordering with forty lines of configuration.
- And **no rule, no plugin, no machine verifying the declared architecture of the repository itself.**

```js
// .eslintrc — what the machine actually checked
rules: {
  "prettier/prettier": "error",
  "import/order": ["error", { /* ... 40 lines of configuration ... */ }],
  "@typescript-eslint/no-explicit-any": "off",
  "react/no-array-index-key": "off",
}
// boundaries between layers? dependency direction? the architecture
// written in docs/ and defended in the ADRs? not a single rule.
```

Adding it up: `strict` disabled in TypeScript, the quality scanner running in the pipeline with failures allowed, and the README citing a library version different from the one installed.

The reading is direct, and it is not about a sloppy team — the team was good and the documentation proves it:

> **What was easy to automate got automated. What mattered was left to the human eye.**

Import order is trivial for a machine to check, so it became a build error. Layer boundaries are hard, so they became a paragraph in a document. And a paragraph in a document only gets checked if someone remembers, during review, on a Friday afternoon, in the sixth MR of the day.

In other words: **code review became the dumping ground for everything we agreed on and never asked a machine to check.** It was the only place those rules really existed.

That is why it does not scale. And that is why, when volume exploded, it broke first.

## 🧠 You do not get faster than your own clarity

There is a second place where speed evaporates, and it is not technical.

The cycle is fast starting from a decided intent. When the intent is **not decided** — when the requirement is still under negotiation, when the business team is still figuring out what it wants — the cycle does not stall. It accelerates in the wrong direction.

It generates the plan. It generates the code. It generates the tests. It generates the documentation that becomes the source of truth for that domain. All on top of a decision that will change the following week.

And here is the counterintuitive point, which took me a while to see:

> **The machine did not reduce the cost of changing your mind. It increased it.**

Because the volume produced per decision got much bigger. Before, a poorly resolved requirement cost a prototype and a conversation. Today it costs an entire change, across multiple repositories, with documentation that is now wrong along with it.

The bottleneck moved. It is no longer in the implementation — it is **before the code**, in the quality of the business decision. And that is exactly why speed goes up *sometimes*: it goes up in exact proportion to how decided the requirement was when it arrived.

**❌ The pattern that costs dearly:**

> "The requirement still has two loose ends, but let's run the cycle and adjust later — it's fast now."

**✅ What we learned:**

> Business ambiguity is resolved at the business layer, before it becomes an artifact. One question answered in the ticket saves an entire MR.

This is not new, it is the old "fixing it in the spec costs 1, fixing it in production costs 100". Except the curve got steeper, because the distance between specifying and producing became an afternoon.

## 🛠️ What we are trying: verification in layers

I do not have a solution to sell you, and this section is not a "do it like this". It is what we are applying now, with partial results.

The central idea is one: **you do not contain volume by reviewing faster. You contain it by moving verification earlier, and distributing it across layers.**

In practice, three responsibilities that do not mix:

**1. The machine proposes.** It reads the whole repository — not the isolated diff, the repository: the neighbouring files, the folder structure, the lint configuration, the architecture documents. It judges adherence to the standard of *that* project, not to some ideal internet standard. That matters more than it seems: the asset is not the model, it is access to context.

**2. The code proves.** Every finding has to pass a deterministic check — ordinary code, no AI involved. Does the cited rule exist in a catalogue written by humans? Does the file exist? Does the quoted snippet **match literally** what is in the file? Is the line commentable? Is it a duplicate of another finding?

Whatever does not pass dies there. It never becomes anyone's opinion.

And here is the most counterintuitive decision of all, the one I had to defend most: **the confidence level the model assigns to itself discards nothing.** It is used for ordering and tie-breaking, that is all. Because it is self-declared and badly calibrated by nature — what discards is the evidence, not the number the model picked for itself.

**3. The person judges merit.** Whatever survived the proof reaches a human to decide what no code can: is this a product decision or a technical problem? Is it worth the friction with a colleague? The thread goes out under the name of whoever reviewed it, and that is what keeps responsibility with people.

The criterion that separates the layers is simple to state:

> **The machine takes what is expensive for a human and cheap to verify** — reading six hundred files, remembering fifty rules. **The human takes what is cheap for a human and impossible to verify by code** — intent, product context, whether the discussion is worth having.

And there is a principle running through all of it that matters well beyond code review:

> **Better to say "I did not review this file" than to review half of it in silence.**

It is the same rule missing in the design system case above. It is the same rule the interface that hid 440 files violated. **Nothing can be filled in, skipped or resolved in silence.**

## 🚨 The traps we already paid for

Five things that went wrong, unsoftened. They are the most useful part of the article.

### 1. A guardrail degrades in silence

A regular expression with one wrong detail truncated the description of every rule in the catalogue at the first line break. **All the rules were like that.** For weeks.

It did not error. It did not turn a test red. It had no symptom. It just produced worse verification — and the entire history of decisions accumulated in that period was measured against a degraded catalogue.

If that sounds familiar, it is because it is exactly the same shape as [94% coverage and 0% confidence](/artigos/testes-unitarios-no-frontend). The green system that was protecting nothing. **Whoever verifies also needs to be verified.**

### 2. A wrong label is worse than an error

The first implementation, on receiving the 440 files with an empty diff, labelled that as "nothing to review".

An error makes someone investigate. **"Resolved" makes everyone move on.** A wrong state that *looks* handled is more dangerous than an exception blowing up in your face, because it consumes the signal without delivering the information.

The fix was to change the source: instead of trusting what the platform API returned, read the content of the local git itself. The check came back with 176 files compared and zero divergences, and coverage went from 170 to 610 reviewable files.

### 3. Verification applied in the wrong context becomes noise — and noise trains the team to ignore it

Through a mapping error, rules from a specific architectural standard were being applied to **every** React repository, whether it followed that standard or not. On top of that: an aggregation layer receiving rules from an architecture that was not its own, and two different rules claiming the same snippet, producing duplicate comments.

A false positive is not just a one-off annoyance. It teaches the team that this verification does not deserve attention — and after that, not even the true findings get read. **Noise is not neutral; it destroys the credibility of the whole channel.**

### 4. If the evidence does not fit in one line, it does not become an automatable rule

Five rules in the catalogue had conditions nobody can confirm by looking at the snippet: "do not use the index as a key **in a list that can be reordered**". Reorderable is not something you see in the line.

Predictable result: false positives reaching a person. The criterion that survived, and that we have applied ever since, is blunt and it works:

> **If the evidence supporting the finding does not fit in the snippet, it does not become a catalogue rule.** It becomes a conversation, a document, an architecture decision — but not an automatic check.

The corollary is that rules requiring knowledge of business intent are permanently out. A machine does not open a discussion about a product decision.

### 5. A stub more permissive than the original is a test that lies

It happened three times, and it earned its own name on the team.

The worst: the stub for an event connection delivered a named message on a channel the real implementation never uses for that. The test passed, clean. **And the real screen hung forever in a loading state.**

It is the direct continuation of what I had already written about [testing what matters](/artigos/testes-unitarios-no-frontend), with a new aggravating factor: when code volume rises, the test stops being just a safety net and becomes **the main evidence that the thing works** — because nobody is going to read the code anymore. A lying stub, in that scenario, does not slow the team down. It deceives the team.

### And one that is not technical

I argued, several times, that we should stop building and use what existed for ten MRs before expanding anything. That is not what happened — there was delivery to do and legitimate pressure from whoever pays the bill.

The result is that I write this article **without the number that matters most**: average review time before and after. I have cost per review, I have execution time, I have file coverage. I do not have the before and after of the original objective.

That is a failure, and it is recorded here on purpose. Measuring before expanding is easy to defend in an article and hard to sustain in a roadmap.

## ✅ When this is worth it (and when it is not)

As always, maturity is in the dose.

**Worth investing when:**

- The volume of change per MR already exceeds what one person reads with real attention.
- A written standard exists — architecture, convention, recorded decision. Without that there is nothing to verify.
- Several teams or repositories share the same standard and it is diverging.
- Security and quality need to be guaranteed at scale, and not by sampling whoever is available.

**Not worth it when:**

- The team is small and the standard genuinely is shared, because everyone talks every week. Automatic verification here is bureaucracy.
- No written standard exists. Automating the verification of something nobody agreed on is industrializing a personal opinion.
- The rule requires knowing business intent, product history or team context. That is not a review finding, it is a conversation.
- You have not measured where it hurts yet. The wrong tool applied fast is more expensive than the original problem.

## 🎯 The right mindset — and the part I am not going to dress up

We arrive at the sentence that honestly sums up where we are:

**Most of the time the MR is not even reviewed. There are too many, with too many changes. There is an automatic check trying to at least keep the company guidelines standing — but in the end, it is one AI reviewing another.**

That sentence is uncomfortable and I am not going to polish it. If this article ended in an "and then we solved it", it would be one more success story and it would be worth less.

But there is an answer to it, and it is the reason the whole design above exists:

**It is only one AI reviewing another if the gate does not happen.**

The design is not circular: the machine proposes, but what discards is a deterministic check against the file — dumb, predictable, auditable code — and what approves is a person signing off with their own name. The proof and the signature are exactly what break the circularity.

The problem is that the gate only works if there is a human left willing to go through it. And what threatens that is precisely the thing it was supposed to contain: volume.

That is where we are now. No happy ending, no chart, in the middle of the experiment.

### The principles to take with you

1. **The gain is proportional to the verifier** → where there is no automatic "it is correct" function, speed becomes a transfer of work, not a saving
2. **Nothing can be filled in silently** → an invented component, a hidden diff, a guessed requirement. A flagged gap costs one question; a filled gap costs a new standard
3. **Verifying early costs minutes; verifying late costs rework** → and with high volume the curve between the two got much steeper
4. **Verifiable evidence is worth more than declared confidence** → what the machine thinks of itself filters nothing; what matches the file does
5. **The human moves from inspection to judgement** → it is not about reviewing faster, it is about reviewing something else: intent, merit, whether the friction is worth it

### The final question

Before the next standup, ask yourself:

**"Is my team reviewing faster — or did it just stop reviewing and start trusting that someone reviewed?"**

If the answer is "someone reviewed", it is worth finding out who. Because it may have been nobody.

## 🎭 Conclusion: the friction was the sensor

The industry spent two years celebrating the removal of friction from development. And friction really was a cost — nobody misses waiting twenty minutes for a build.

But part of that slowness was not waste. **It was the mechanism that detected ambiguity.**

When the requirement was poorly resolved, the dev stalled and asked. When the design asked for something that did not exist, someone opened a conversation. When the MR got too big, someone complained and split it. The slowness was uncomfortable — and that is exactly why it worked. It forced the decision to happen in front of people.

The machine removed the friction without replacing the mechanism. Today ambiguity does not stall anything. It becomes one hundred and eighteen files.

Just as in [the exam effect in code](/artigos/efeito-enem-no-codigo), where the habit was delivering the minimum to clear the level without understanding why, and just as I have written about [the fundamentals in the AI era](/artigos/o-basico-de-ia) — where the friction that vanished was exactly where learning happened — here the pattern repeats at a new scale: **the friction that vanished was where decisions were made.**

The way out is not to reintroduce slowness on purpose. It is to rebuild the sensor somewhere else: turn the written standard into a verified standard, force the system to declare what it does not know, and reserve human judgement for what only humans decide.

**The problem is not technical. It is that we automated production and left understanding manual.**

---

_This is happening right now, as I write. I do not have the before and after, I do not have the lead time chart, and I am suspicious of anyone who has it this early. What I do have is the certainty that writing code stopped being the bottleneck — and that we are still figuring out what to do with the queue that formed on the other side._

**Producing became cheap. Understanding still costs the same. And understanding is the part you cannot outsource.**

## 📚 References and further reading

This article was built on practice in progress and on ideas that helped name what was happening:

- **Martin Fowler** — [Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html) and the writings on evolutionary design: why integration speed was always limited by the capacity to understand the change.

- **Matthew Skelton and Manuel Pais** — _Team Topologies_: cognitive load as a team's real limit, and the role of a platform in reducing it instead of transferring it.

- **Nicole Forsgren, Jez Humble and Gene Kim** — _Accelerate_: why flow metrics (lead time, change failure rate) say more than output metrics, and why "more code" was never an indicator of anything.

- **Google Engineering Practices** — [Code Review Developer Guide](https://google.github.io/eng-practices/review/): the most mature guide on review size, scope and what a reviewer should actually look for.

- **Michael Feathers** — _Working Effectively with Legacy Code_: how to deal with code you do not understand — a competence that stopped being an exception and became routine.

- **Kent Beck** — _Tidy First?_: design as the economics of change. The relevant question was never "is it pretty", it is "how much will it cost to change this".

- **Kent C. Dodds** — [Testing Library](https://testing-library.com/): test the way the software is used. When nobody reads the code anymore, the test becomes the main evidence — and a permissive stub becomes a lie.

- **Andrej Karpathy** — public reflections on AI-assisted development and the human role of steering and verification: generating became cheap, verifying became the work.

- **Charity Majors** — writings on observability and systems you cannot predict: the idea that the system needs to tell you what is happening, instead of you having to guess.

---

_If you work on a team that adopted an agentic cycle and you feel the maths does not add up the way it was promised, you are not alone. Share this with whoever reviews MRs on your team — and let's be honest about what is working and what is not._

**👏 Enjoyed it? Leave a clap and tell me in the comments: what is the biggest MR you approved without reading in full?**
